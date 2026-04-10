const db = require('../models');
const { Op } = require('sequelize');

const parsePriceValue = (value) => {
    if (value === undefined || value === null) return 0;
    const numeric = String(value).replace(/[^\d]/g, '');
    return Number(numeric || 0);
};

const getAllBookingsForAdmin = async (statusFilter) => {
    try {
        const where = {};
        if (statusFilter === 'unpaid') {
            where.statusId = { [Op.ne]: 'S3' };
            where.paymentStatus = { [Op.ne]: 'paid' };
        }

        if (statusFilter === 'paid') {
            where.statusId = { [Op.ne]: 'S3' };
            where.paymentStatus = 'paid';
        }

        if (statusFilter === 'examined') {
            where.statusId = 'S3';
        }

        const bookings = await db.Booking.findAll({
            where,
            attributes: ['id', 'statusId', 'paymentStatus', 'paymentMethod', 'paymentAmount', 'doctorId', 'patientId', 'date', 'timeType', 'createdAt'],
            raw: true,
            order: [['createdAt', 'DESC']]
        });

        if (!bookings || bookings.length === 0) {
            return {
                errCode: 0,
                errMessage: 'OK',
                data: []
            };
        }

        const doctorIds = [...new Set(bookings.map(item => item.doctorId).filter(Boolean))];
        const patientIds = [...new Set(bookings.map(item => item.patientId).filter(Boolean))];
        const timeTypes = [...new Set(bookings.map(item => item.timeType).filter(Boolean))];

        const [doctors, patients, times, doctorInfors] = await Promise.all([
            db.User.findAll({
                where: { id: doctorIds },
                attributes: ['id', 'firstName', 'lastName', 'email'],
                raw: true
            }),
            db.User.findAll({
                where: { id: patientIds },
                attributes: ['id', 'firstName', 'lastName', 'email', 'phonenumber'],
                raw: true
            }),
            db.Allcode.findAll({
                where: { keyMap: timeTypes },
                attributes: ['keyMap', 'valueEn', 'valueVi'],
                raw: true
            }),
            db.Doctor_Infor.findAll({
                where: { doctorId: doctorIds },
                include: [{ model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] }],
                raw: false,
                nest: true
            })
        ]);

        const doctorMap = new Map(doctors.map(item => [item.id, item]));
        const patientMap = new Map(patients.map(item => [item.id, item]));
        const timeMap = new Map(times.map(item => [item.keyMap, item]));
        const doctorInforMap = new Map(
            doctorInfors.map(item => {
                const plain = item.get({ plain: true });
                return [plain.doctorId, plain];
            })
        );

        return {
            errCode: 0,
            errMessage: 'OK',
            data: bookings.map(item => ({
                ...item,
                paymentAmount: item.paymentAmount || parsePriceValue(doctorInforMap.get(item.doctorId)?.priceTypeData?.valueVi) || parsePriceValue(doctorInforMap.get(item.doctorId)?.priceTypeData?.valueEn) || 0,
                doctorData: doctorMap.get(item.doctorId) || null,
                patientData: patientMap.get(item.patientId) || null,
                timeTypeData: timeMap.get(item.timeType) || null
            }))
        };
    } catch (e) {
        throw e;
    }
};

const getAllPaymentsForAdmin = async (paymentStatus) => {
    const where = {};
    if (paymentStatus) {
        where.paymentStatus = paymentStatus;
    }

    const bookings = await db.Booking.findAll({
        where,
        attributes: [
            'id',
            'statusId',
            'paymentStatus',
            'paymentMethod',
            'paymentRef',
            'paymentAmount',
            'doctorId',
            'patientId',
            'date',
            'timeType',
            'createdAt'
        ],
        raw: true,
        order: [['createdAt', 'DESC']]
    });

    if (!bookings || bookings.length === 0) {
        return {
            errCode: 0,
            errMessage: 'OK',
            data: []
        };
    }

    const doctorIds = [...new Set(bookings.map(item => item.doctorId).filter(Boolean))];
    const patientIds = [...new Set(bookings.map(item => item.patientId).filter(Boolean))];
    const timeTypes = [...new Set(bookings.map(item => item.timeType).filter(Boolean))];

    const [doctors, patients, times, doctorInfors, paymentConfig] = await Promise.all([
        db.User.findAll({
            where: { id: doctorIds },
            attributes: ['id', 'firstName', 'lastName', 'email'],
            raw: true
        }),
        db.User.findAll({
            where: { id: patientIds },
            attributes: ['id', 'firstName', 'lastName', 'email', 'phonenumber'],
            raw: true
        }),
        db.Allcode.findAll({
            where: { keyMap: timeTypes },
            attributes: ['keyMap', 'valueEn', 'valueVi'],
            raw: true
        }),
        db.Doctor_Infor.findAll({
            where: { doctorId: doctorIds },
            include: [{ model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] }],
            raw: false,
            nest: true
        }),
        db.Payment_Config.findOne({
            order: [['updatedAt', 'DESC']],
            raw: true
        })
    ]);

    const doctorMap = new Map(doctors.map(item => [item.id, item]));
    const patientMap = new Map(patients.map(item => [item.id, item]));
    const timeMap = new Map(times.map(item => [item.keyMap, item]));
    const doctorInforMap = new Map(
        doctorInfors.map(item => {
            const plain = item.get({ plain: true });
            return [plain.doctorId, plain];
        })
    );

    const data = bookings.map(item => {
        const transferText = `${paymentConfig?.defaultTransferContent || 'BOOKING'} ${item.id}`.trim();
        const doctorInfor = doctorInforMap.get(item.doctorId);
        const fallbackAmount = parsePriceValue(doctorInfor?.priceTypeData?.valueVi) || parsePriceValue(doctorInfor?.priceTypeData?.valueEn);
        const amount = item.paymentAmount || fallbackAmount || 0;
        let qrUrl = '';

        if (paymentConfig?.isActive !== false && paymentConfig?.bankCode && paymentConfig?.accountNumber && paymentConfig?.accountName) {
            qrUrl = `https://img.vietqr.io/image/${paymentConfig.bankCode}-${paymentConfig.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferText)}&accountName=${encodeURIComponent(paymentConfig.accountName)}`;
        }

        return {
            ...item,
            paymentAmount: amount,
            doctorData: doctorMap.get(item.doctorId) || null,
            patientData: patientMap.get(item.patientId) || null,
            timeTypeData: timeMap.get(item.timeType) || null,
            qrUrl,
            transferText
        };
    });

    return {
        errCode: 0,
        errMessage: 'OK',
        data
    };
};

module.exports = {
    getAllBookingsForAdmin,
    getAllPaymentsForAdmin
};
