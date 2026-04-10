import db from '../models/index';
require('dotenv').config();
import emailService from '../services/email.Service';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import moment from 'moment';

const VNPAY_PAYMENT_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:6969/api/vnpay-return';
const VNPAY_IPN_URL = process.env.VNPAY_IPN_URL || 'http://localhost:6969/api/vnpay-ipn';

const padNumber = (num) => String(num).padStart(2, '0');

const formatVnpDate = (date = new Date()) => {
    return `${date.getFullYear()}${padNumber(date.getMonth() + 1)}${padNumber(date.getDate())}${padNumber(date.getHours())}${padNumber(date.getMinutes())}${padNumber(date.getSeconds())}`;
};

const sortObject = (input) => {
    const sorted = {};
    Object.keys(input).sort().forEach((key) => {
        sorted[key] = input[key];
    });
    return sorted;
};

const buildSignedQuery = (params) => {
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
    if (value === undefined || value === null) return 0;
    const numeric = String(value).replace(/[^\d]/g, '');
    return Number(numeric || 0);
};

const sanitizeVnpText = (value) => {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const parseScheduleStart = (value = '') => {
    const normalized = String(value).trim().toUpperCase();
    const match = normalized.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/);

    if (!match) {
        return null;
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3];

    if (meridiem === 'AM' && hours === 12) hours = 0;
    if (meridiem === 'PM' && hours < 12) hours += 12;

    return { hours, minutes };
};

const getBookingStartTimestamp = (dateValue, timeCode) => {
    const parsed =
        parseScheduleStart(timeCode?.valueEn) ||
        parseScheduleStart(timeCode?.valueVi);

    if (!parsed) {
        return moment(Number(dateValue)).valueOf();
    }

    return moment(Number(dateValue))
        .startOf('day')
        .hour(parsed.hours)
        .minute(parsed.minutes)
        .second(0)
        .millisecond(0)
        .valueOf();
};

const getFrontendPaymentResultUrl = (status, bookingId, responseCode = '') => {
    const clientUrl = process.env.CLIENT_URL || process.env.URL_REACT || 'http://localhost:3000';
    return `${clientUrl}/patient/booking-history?vnpay=${status}&bookingId=${bookingId || ''}&code=${responseCode || ''}`;
};

let buildUrlEmail = (doctorId, token) => {
    return `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
}

const mapFullNameToUserFields = (fullName = '') => {
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
            if (!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullName) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            }
            const normalizedEmail = String(data.email).trim().toLowerCase();

            const [timeCode, existedSchedule] = await Promise.all([
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
                await db.Booking.findOrCreate({
                    where: {
                        patientId: patientRecord.id,
                        doctorId: data.doctorId,
                        date: data.date,
                        timeType: data.timeType
                    },
                    defaults: {
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
                    }
                });
            }

            try {
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
                return resolve({ errCode: 3, errMessage: 'Booking not found' });
            }

            if (booking.paymentStatus === 'paid') {
                return resolve({ errCode: 4, errMessage: 'Booking has already been paid' });
            }

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

            const validSignature = signVnpParams(inputData) === vnpSecureHash;
            const txnRef = query.vnp_TxnRef || '';
            const bookingId = txnRef.startsWith('BOOKING_') ? txnRef.replace('BOOKING_', '') : '';
            const responseCode = query.vnp_ResponseCode || '';

            if (!validSignature || !bookingId) {
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
