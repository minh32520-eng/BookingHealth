const db = require('../models');

const parseMoneyValue = (valueVi, valueEn) => {
    const fromVi = Number(String(valueVi || '').replace(/[^\d]/g, ''));
    if (!Number.isNaN(fromVi) && fromVi > 0) return fromVi;

    const fromEn = Number(String(valueEn || '').replace(/[^\d.]/g, ''));
    if (!Number.isNaN(fromEn) && fromEn > 0) {
        return fromEn * 10000;
    }

    return 0;
};

const buildEmptyMonthly = () => Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    revenue: 0,
    bookings: 0
}));

const getRevenueDashboard = async (yearInput, filters = {}) => {
    try {
        const year = Number(yearInput) || new Date().getFullYear();
        const doctorIdFilter = filters.doctorId ? Number(filters.doctorId) : null;
        const clinicIdFilter = filters.clinicId ? Number(filters.clinicId) : null;
        const start = new Date(year, 0, 1).getTime();
        const end = new Date(year + 1, 0, 1).getTime();

        const bookings = await db.Booking.findAll({
            where: { paymentStatus: 'paid' },
            attributes: ['id', 'doctorId', 'date', 'paymentStatus'],
            raw: true
        });

        const bookingsInYear = (bookings || []).filter((item) => {
            const ts = Number(item.date);
            return !Number.isNaN(ts) && ts >= start && ts < end;
        });

        const doctorIds = [...new Set(bookingsInYear.map((item) => item.doctorId).filter(Boolean))];

        if (!doctorIds.length) {
            return {
                errCode: 0,
                errMessage: 'OK',
                data: {
                    year,
                    totalRevenue: 0,
                    totalBookings: 0,
                    averageRevenuePerBooking: 0,
                    monthlyRevenue: buildEmptyMonthly()
                }
            };
        }

        const doctorInfors = await db.Doctor_Infor.findAll({
            where: { doctorId: doctorIds },
            attributes: ['doctorId', 'priceId', 'nameClinic', 'addressClinic'],
            raw: true
        });

        let clinicMap = new Map();
        if (clinicIdFilter) {
            const clinics = await db.Clininc.findAll({
                attributes: ['id', 'name', 'address'],
                raw: true
            });
            clinicMap = new Map(clinics.map((item) => [item.id, item]));
        }

        const filteredDoctorInfors = doctorInfors.filter((item) => {
            if (doctorIdFilter && Number(item.doctorId) !== doctorIdFilter) {
                return false;
            }

            if (clinicIdFilter) {
                const clinic = clinicMap.get(clinicIdFilter);
                if (!clinic) return false;
                const sameName = String(item.nameClinic || '').trim() === String(clinic.name || '').trim();
                const sameAddress = !clinic.address || String(item.addressClinic || '').trim() === String(clinic.address || '').trim();
                return sameName && sameAddress;
            }

            return true;
        });

        const allowedDoctorIds = new Set(filteredDoctorInfors.map((item) => Number(item.doctorId)));
        const filteredBookings = bookingsInYear.filter((item) => allowedDoctorIds.has(Number(item.doctorId)));

        if (!filteredBookings.length) {
            return {
                errCode: 0,
                errMessage: 'OK',
                data: {
                    year,
                    totalRevenue: 0,
                    totalBookings: 0,
                    averageRevenuePerBooking: 0,
                    monthlyRevenue: buildEmptyMonthly()
                }
            };
        }

        const priceIds = [...new Set(filteredDoctorInfors.map((item) => item.priceId).filter(Boolean))];
        const priceCodes = await db.Allcode.findAll({
            where: { keyMap: priceIds },
            attributes: ['keyMap', 'valueVi', 'valueEn'],
            raw: true
        });

        const priceMap = new Map(
            priceCodes.map((item) => [item.keyMap, parseMoneyValue(item.valueVi, item.valueEn)])
        );
        const doctorPriceMap = new Map(
            filteredDoctorInfors.map((item) => [item.doctorId, priceMap.get(item.priceId) || 0])
        );

        const monthlyRevenue = buildEmptyMonthly();

        let totalRevenue = 0;

        filteredBookings.forEach((item) => {
            const amount = doctorPriceMap.get(item.doctorId) || 0;
            const date = new Date(Number(item.date));
            const monthIndex = date.getMonth();
            monthlyRevenue[monthIndex].revenue += amount;
            monthlyRevenue[monthIndex].bookings += 1;
            totalRevenue += amount;
        });

        const totalBookings = filteredBookings.length;
        const averageRevenuePerBooking = totalBookings ? Math.round(totalRevenue / totalBookings) : 0;

        return {
            errCode: 0,
            errMessage: 'OK',
            data: {
                year,
                doctorId: doctorIdFilter,
                clinicId: clinicIdFilter,
                totalRevenue,
                totalBookings,
                averageRevenuePerBooking,
                monthlyRevenue
            }
        };
    } catch (e) {
        throw e;
    }
};

module.exports = {
    getRevenueDashboard
};
