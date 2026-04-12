import db from '../models/index';
require('dotenv').config();
import emailService from '../services/email.Service';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import moment from 'moment';
import { Op } from 'sequelize';
const { getScheduleStartTimestamp: getBookingStartTimestamp } = require('../utils/schedule');

const VNPAY_PAYMENT_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:6969/api/vnpay-return';
const VNPAY_IPN_URL = process.env.VNPAY_IPN_URL || 'http://localhost:6969/api/vnpay-ipn';
const MAX_BOOKINGS_PER_SLOT = 3;

const padNumber = (num) => String(num).padStart(2, '0');

const formatVnpDate = (date = new Date()) => {
    // VNPAY expects timestamps in YYYYMMDDHHmmss format.
    return `${date.getFullYear()}${padNumber(date.getMonth() + 1)}${padNumber(date.getDate())}${padNumber(date.getHours())}${padNumber(date.getMinutes())}${padNumber(date.getSeconds())}`;
};

const sortObject = (input) => {
    const sorted = {};
    // VNPAY signs parameters in sorted key order, so we normalize the object first.
    Object.keys(input).sort().forEach((key) => {
        sorted[key] = input[key];
    });
    return sorted;
};

const buildSignedQuery = (params) => {
    // Build the exact query string that VNPAY signs and verifies.
    const sorted = sortObject(params);
    return Object.keys(sorted)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(sorted[key]).replace(/%20/g, '+')}`)
        .join('&');
};

const signVnpParams = (params) => {
    const secret = process.env.VNPAY_HASH_SECRET || '';
    const signData = buildSignedQuery(params);
    return crypto
        .createHmac('sha512', secret)
        .update(Buffer.from(signData, 'utf-8'))
        .digest('hex');
};

const parsePriceValue = (value) => {
    // Price allcodes may be stored as formatted strings, so strip everything except digits.
    if (value === undefined || value === null) return 0;
    const numeric = String(value).replace(/[^\d]/g, '');
    return Number(numeric || 0);
};

const sanitizeVnpText = (value) => {
    // VNPAY order info works better with plain ASCII text, so normalize and strip accents/special chars.
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const getFrontendPaymentResultUrl = (status, bookingId, responseCode = '') => {
    // Always send payment results back to the patient booking history page in the frontend.
    const clientUrl = process.env.CLIENT_URL || process.env.URL_REACT || 'http://localhost:3000';
    return `${clientUrl}/patient/booking-history?vnpay=${status}&bookingId=${bookingId || ''}&code=${responseCode || ''}`;
};

let buildUrlEmail = (doctorId, token) => {
    // Email verification links use the frontend page that confirms a pending booking token.
    return `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
}

const mapFullNameToUserFields = (fullName = '') => {
    // The current user table only has firstName/lastName, so split one free-text name here.
    const parts = String(fullName).trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return {
            firstName: '',
            lastName: ''
        };
    }

    if (parts.length === 1) {
        return {
            firstName: parts[0],
            lastName: ''
        };
    }

    return {
        firstName: parts[parts.length - 1],
        lastName: parts.slice(0, -1).join(' ')
    };
};

let postBookAppointment = (data) => {
    return new Promise(async (resolve) => {
        try {
            // Validate the minimum booking payload before any DB work or email sending starts.
            if (!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullName) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            }
            const normalizedEmail = String(data.email).trim().toLowerCase();

            const [timeCode, existedSchedule] = await Promise.all([
                // Load the selected time label and confirm the schedule slot still exists at booking time.
                db.Allcode.findOne({
                    where: { keyMap: data.timeType },
                    attributes: ['keyMap', 'valueEn', 'valueVi'],
                    raw: true
                }),
                db.Schedule.findOne({
                    where: {
                        doctorId: data.doctorId,
                        date: data.date,
                        timeType: data.timeType
                    },
                    raw: true
                })
            ]);

            if (!timeCode || !existedSchedule) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Selected schedule is not available'
                });
            }

            // Frontend hides expired slots, but the backend still blocks stale or crafted requests.
            const bookingStart = getBookingStartTimestamp(data.date, timeCode);
            if (bookingStart <= moment().valueOf()) {
                return resolve({
                    errCode: 3,
                    errMessage: 'Cannot book past schedules'
                });
            }

            let token = uuidv4();
            const doctorInfor = await db.Doctor_Infor.findOne({
                where: { doctorId: data.doctorId },
                include: [{ model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] }],
                raw: false,
                nest: true
            });
            // Snapshot the current consultation price into the booking so later changes do not rewrite history.
            const doctorInforData = doctorInfor ? doctorInfor.get({ plain: true }) : null;
            const paymentAmount = parsePriceValue(doctorInforData?.priceTypeData?.valueVi) || parsePriceValue(doctorInforData?.priceTypeData?.valueEn);

            let patientRecord = null;

            if (data.patientId) {
                patientRecord = await db.User.findOne({
                    where: { id: data.patientId },
                    raw: true
                });
            }

            if (!patientRecord) {
                // Create a patient account lazily when the booking email does not belong to an existing user yet.
                let user = await db.User.findOrCreate({
                    where: { email: normalizedEmail },
                    defaults: {
                        email: normalizedEmail,
                        roleId: 'R3'
                    },
                    raw: false
                });

                patientRecord = user && user[0]
                    ? (user[0].get ? user[0].get({ plain: true }) : user[0])
                    : null;
            }

            if (patientRecord) {
                const mappedName = mapFullNameToUserFields(data.fullName);

                // Refresh the patient profile with the latest info entered in the booking form.
                await db.User.update(
                    {
                        firstName: mappedName.firstName || patientRecord.firstName || '',
                        lastName: mappedName.lastName || patientRecord.lastName || '',
                        address: data.address || patientRecord.address || '',
                        phoneNumber: data.phoneNumber || patientRecord.phoneNumber || '',
                        gender: data.selectedGender || patientRecord.gender || ''
                    },
                    {
                        where: { id: patientRecord.id }
                    }
                );
            }

            if (patientRecord) {
                const bookingResult = await db.sequelize.transaction(async (transaction) => {
                    const lockedSchedule = await db.Schedule.findOne({
                        where: {
                            doctorId: data.doctorId,
                            date: data.date,
                            timeType: data.timeType
                        },
                        raw: false,
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });

                    if (!lockedSchedule) {
                        return {
                            errCode: 2,
                            errMessage: 'Selected schedule is not available'
                        };
                    }

                    const slotLimit = MAX_BOOKINGS_PER_SLOT;
                    const activeBookingWhere = {
                        doctorId: data.doctorId,
                        date: data.date,
                        timeType: data.timeType,
                        statusId: {
                            [Op.in]: ['S1', 'S2', 'S3']
                        }
                    };

                    const [activeBookingCount, duplicateBooking] = await Promise.all([
                        db.Booking.count({
                            where: activeBookingWhere,
                            transaction
                        }),
                        db.Booking.findOne({
                            where: {
                                patientId: patientRecord.id,
                                doctorId: data.doctorId,
                                date: data.date,
                                timeType: data.timeType
                            },
                            raw: true,
                            transaction
                        })
                    ]);

                    lockedSchedule.maxNumber = slotLimit;
                    lockedSchedule.currentNumber = activeBookingCount;

                    if (duplicateBooking) {
                        await lockedSchedule.save({ transaction });
                        return {
                            errCode: 4,
                            errMessage: 'You have already booked this schedule'
                        };
                    }

                    if (activeBookingCount >= slotLimit) {
                        await lockedSchedule.save({ transaction });
                        return {
                            errCode: 5,
                            errMessage: 'This schedule is fully booked'
                        };
                    }

                    await db.Booking.create({
                        statusId: 'S1',
                        paymentStatus: 'pending',
                        paymentMethod: 'VNPAY',
                        paymentRef: `BOOKING_${Date.now()}`,
                        paymentAmount: paymentAmount || 0,
                        doctorId: data.doctorId,
                        patientId: patientRecord.id,
                        date: data.date,
                        timeType: data.timeType,
                        token: token
                    }, {
                        transaction
                    });

                    lockedSchedule.currentNumber = activeBookingCount + 1;
                    await lockedSchedule.save({ transaction });

                    return {
                        errCode: 0,
                        errMessage: 'OK'
                    };
                });

                if (bookingResult.errCode !== 0) {
                    return resolve(bookingResult);
                }
            }

            try {
                // Send the verification email only after the booking row exists, so the token has something to activate.
                await emailService.sendSimpleEmail({
                    reciverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token)
                });
            } catch (emailError) {
                console.log('EMAIL booking error:', emailError);
                return resolve({
                    errCode: 2,
                    errMessage: emailError?.message || 'Send email failed'
                });
            }

            return resolve({
                errCode: 0,
                errMessage: 'Save infor patient succeed!'
            });
        } catch (e) {
            console.log('postBookAppointment error:', e);
            return resolve({
                errCode: -1,
                errMessage: e?.message || 'Error from the server'
            });
        }
    })
}

let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        // Only pending bookings can be activated through the email confirmation link.
                        statusId: 'S1'
                    },
                    raw: false
                });

                if (appointment) {
                    appointment.statusId = 'S2';
                    await appointment.save();

                    resolve({
                        errCode: 0,
                        errMessage: 'Update the appointment succeed!'
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Appointment has been activated or does not exist'
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getBookingHistoryByPatient = (patientId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter',
                    data: []
                });
                return;
            }

            let bookings = await db.Booking.findAll({
                where: { patientId: patientId },
                raw: true,
                order: [['createdAt', 'DESC']]
            });

            if (!bookings || bookings.length === 0) {
                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                    data: []
                });
                return;
            }

            let doctorIds = [...new Set(bookings.map(item => item.doctorId).filter(Boolean))];
            let timeTypes = [...new Set(bookings.map(item => item.timeType).filter(Boolean))];
            let statusIds = [...new Set(bookings.map(item => item.statusId).filter(Boolean))];

            let [doctors, times, statuses] = await Promise.all([
                // Resolve all display labels in parallel so the history page needs only one API call.
                db.User.findAll({
                    where: { id: doctorIds },
                    attributes: ['id', 'firstName', 'lastName'],
                    raw: true
                }),
                db.Allcode.findAll({
                    where: { keyMap: timeTypes },
                    attributes: ['keyMap', 'valueEn', 'valueVi'],
                    raw: true
                }),
                db.Allcode.findAll({
                    where: { keyMap: statusIds },
                    attributes: ['keyMap', 'valueEn', 'valueVi'],
                    raw: true
                })
            ]);

            let doctorMap = new Map(doctors.map(item => [item.id, item]));
            let timeMap = new Map(times.map(item => [item.keyMap, item]));
            let statusMap = new Map(statuses.map(item => [item.keyMap, item]));

            // Attach doctor/time/status display data so the history page can render in one request.
            let data = bookings.map(item => ({
                ...item,
                doctorData: doctorMap.get(item.doctorId) || null,
                timeTypeData: timeMap.get(item.timeType) || null,
                statusData: statusMap.get(item.statusId) || null
            }));

            resolve({
                errCode: 0,
                errMessage: 'OK',
                data
            });
        } catch (e) {
            reject(e);
        }
    });
};

let createVnpayPaymentUrl = (data, ipAddr) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.bookingId || !data.patientId) {
                return resolve({ errCode: 1, errMessage: 'Missing parameter' });
            }

            if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET) {
                return resolve({ errCode: 2, errMessage: 'VNPAY is not configured' });
            }

            const booking = await db.Booking.findOne({
                where: { id: data.bookingId, patientId: data.patientId },
                raw: true
            });

            if (!booking) {
                // Only the owner of the booking can request a payment URL for that booking.
                return resolve({ errCode: 3, errMessage: 'Booking not found' });
            }

            if (booking.paymentStatus === 'paid') {
                return resolve({ errCode: 4, errMessage: 'Booking has already been paid' });
            }

            // Load doctor identity and pricing together because both are needed to create the order.
            const [doctor, doctorInfor] = await Promise.all([
                db.User.findOne({
                    where: { id: booking.doctorId },
                    attributes: ['firstName', 'lastName'],
                    raw: true
                }),
                db.Doctor_Infor.findOne({
                    where: { doctorId: booking.doctorId },
                    include: [{ model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] }],
                    raw: false,
                    nest: true
                })
            ]);

            const doctorInforData = doctorInfor ? doctorInfor.get({ plain: true }) : null;
            const amountVnd = parsePriceValue(doctorInforData?.priceTypeData?.valueVi) || parsePriceValue(doctorInforData?.priceTypeData?.valueEn);

            if (!amountVnd) {
                return resolve({ errCode: 5, errMessage: 'Doctor price is not configured' });
            }

            const txnRef = `BOOKING_${booking.id}`;
            const doctorName = `${doctor?.lastName || ''} ${doctor?.firstName || ''}`.trim() || `Doctor ${booking.doctorId}`;
            const now = new Date();
            const expireDate = new Date(now.getTime() + 15 * 60 * 1000);
            const createDate = formatVnpDate(now);
            const orderInfo = sanitizeVnpText(`Thanh toan lich kham ${booking.id} cho ${doctorName}`);

            const vnpParams = {
                // These are the core VNPAY fields used to create one payment order.
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: process.env.VNPAY_TMN_CODE,
                vnp_Locale: data.language === 'en' ? 'en' : 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: 'other',
                vnp_Amount: String(amountVnd * 100),
                vnp_ReturnUrl: VNPAY_RETURN_URL,
                vnp_IpAddr: ipAddr || '127.0.0.1',
                vnp_CreateDate: createDate,
                vnp_ExpireDate: formatVnpDate(expireDate)
            };

            if (VNPAY_IPN_URL) vnpParams.vnp_IpnUrl = VNPAY_IPN_URL;
            if (data.bankCode) vnpParams.vnp_BankCode = data.bankCode;

            // Save the payment snapshot before redirecting so the order is traceable even
            // if the user closes the browser before the callback returns.
            await db.Booking.update({
                paymentStatus: 'pending',
                paymentMethod: 'VNPAY',
                paymentRef: txnRef,
                paymentAmount: amountVnd,
                paymentPayload: JSON.stringify({
                    orderInfo,
                    amountVnd,
                    locale: vnpParams.vnp_Locale
                })
            }, {
                where: { id: booking.id }
            });

            vnpParams.vnp_SecureHash = signVnpParams(vnpParams);
            const paymentUrl = `${VNPAY_PAYMENT_URL}?${buildSignedQuery(vnpParams)}`;

            resolve({ errCode: 0, errMessage: 'OK', data: { paymentUrl } });
        } catch (e) {
            reject(e);
        }
    });
};

let handleVnpayReturn = (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            const vnpSecureHash = query.vnp_SecureHash;
            const inputData = { ...query };
            delete inputData.vnp_SecureHash;
            delete inputData.vnp_SecureHashType;

            // Never trust callback data until the signature matches the secret key.
            const validSignature = signVnpParams(inputData) === vnpSecureHash;
            const txnRef = query.vnp_TxnRef || '';
            const bookingId = txnRef.startsWith('BOOKING_') ? txnRef.replace('BOOKING_', '') : '';
            const responseCode = query.vnp_ResponseCode || '';

            if (!validSignature || !bookingId) {
                // Reject tampered callback data immediately and send the user back with an error state.
                return resolve({
                    errCode: 1,
                    bookingId,
                    responseCode,
                    redirectUrl: getFrontendPaymentResultUrl('invalid-signature', bookingId, responseCode)
                });
            }

            const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: false });
            if (!booking) {
                return resolve({
                    errCode: 2,
                    bookingId,
                    responseCode,
                    redirectUrl: getFrontendPaymentResultUrl('not-found', bookingId, responseCode)
                });
            }

            booking.paymentMethod = 'VNPAY';
            booking.paymentRef = txnRef;
            booking.paymentStatus = responseCode === '00' ? 'paid' : 'failed';
            booking.paymentPayload = JSON.stringify(query);

            // In the current business flow, a paid booking is also treated as confirmed.
            if (responseCode === '00' && booking.statusId === 'S1') {
                booking.statusId = 'S2';
            }
            await booking.save();

            const status = responseCode === '00' ? 'success' : 'failed';
            resolve({ errCode: 0, bookingId, responseCode, redirectUrl: getFrontendPaymentResultUrl(status, bookingId, responseCode) });
        } catch (e) {
            reject(e);
        }
    });
};

let handleVnpayIpn = (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            const vnpSecureHash = query.vnp_SecureHash;
            const inputData = { ...query };
            delete inputData.vnp_SecureHash;
            delete inputData.vnp_SecureHashType;

            const validSignature = signVnpParams(inputData) === vnpSecureHash;
            if (!validSignature) {
                return resolve({ RspCode: '97', Message: 'Invalid Signature' });
            }

            const txnRef = query.vnp_TxnRef || '';
            const bookingId = txnRef.startsWith('BOOKING_') ? txnRef.replace('BOOKING_', '') : '';
            if (!bookingId) {
                return resolve({ RspCode: '01', Message: 'Order not found' });
            }

            const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: false });
            if (!booking) {
                return resolve({ RspCode: '01', Message: 'Order not found' });
            }

            if (booking.paymentStatus === 'paid') {
                // Return the official "already confirmed" response so VNPAY does not keep retrying this order.
                return resolve({ RspCode: '02', Message: 'Order already confirmed' });
            }

            booking.paymentMethod = 'VNPAY';
            booking.paymentRef = txnRef;
            booking.paymentPayload = JSON.stringify(query);

            if (query.vnp_ResponseCode === '00') {
                booking.paymentStatus = 'paid';
                booking.statusId = 'S2';
            } else {
                booking.paymentStatus = 'failed';
            }

            await booking.save();

            return resolve({ RspCode: '00', Message: 'Confirm Success' });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    postBookAppointment,
    postVerifyBookAppointment,
    getBookingHistoryByPatient,
    createVnpayPaymentUrl,
    handleVnpayReturn,
    handleVnpayIpn
}
