import moment from 'moment';
import { LANGUAGES } from './constant';

class BookingUtils {
    static getLocalizedValue(data, language = LANGUAGES.VI, fallback = '--', viField = 'valueVi', enField = 'valueEn') {
        if (!data) return fallback;
        return language === LANGUAGES.VI
            ? data?.[viField] || fallback
            : data?.[enField] || fallback;
    }

    static getUserDisplayName(user, language = LANGUAGES.VI, fallback = '--') {
        if (!user) return fallback;

        if (language === LANGUAGES.VI) {
            return `${user.lastName || ''} ${user.firstName || ''}`.trim() || user.email || fallback;
        }

        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || fallback;
    }

    static formatDate(dateValue, format = 'DD/MM/YYYY') {
        if (!dateValue) return '--';
        return moment(Number(dateValue)).format(format);
    }

    static formatDateTime(dateValue, format = 'DD/MM/YYYY HH:mm') {
        if (!dateValue) return '--';
        return moment(dateValue).format(format);
    }

    static getTimeLabel(timeData, language = LANGUAGES.VI, fallback = '--') {
        return BookingUtils.getLocalizedValue(timeData, language, fallback);
    }

    static formatCurrency(amount, language = LANGUAGES.VI, currency = 'VND') {
        const value = Number(amount || 0);
        return new Intl.NumberFormat(language === LANGUAGES.VI ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0
        }).format(value);
    }

    static getBookingStatusLabel(statusId, intl, options = {}) {
        const pendingId = options.pendingId || 'admin.manage-booking.status.pending-confirm';
        const confirmedId = options.confirmedId || 'admin.manage-booking.status.confirmed';
        const examinedId = options.examinedId || 'admin.manage-booking.status.examined';
        const fallback = options.fallback || statusId || '--';

        if (!intl?.formatMessage) return fallback;
        if (statusId === 'S1') return intl.formatMessage({ id: pendingId });
        if (statusId === 'S2') return intl.formatMessage({ id: confirmedId });
        if (statusId === 'S3') return intl.formatMessage({ id: examinedId });
        return fallback;
    }

    static getPaymentStatusLabel(paymentStatus, options = {}) {
        const { intl, language = LANGUAGES.VI } = options;
        const pendingId = options.pendingId || 'admin.manage-booking.payment.pending';
        const paidId = options.paidId || 'admin.manage-booking.payment.paid';
        const failedId = options.failedId || 'admin.manage-booking.payment.failed';

        if (intl?.formatMessage) {
            if (paymentStatus === 'paid') return intl.formatMessage({ id: paidId });
            if (paymentStatus === 'failed') return intl.formatMessage({ id: failedId });
            return intl.formatMessage({ id: pendingId });
        }

        if (language === LANGUAGES.EN) {
            if (paymentStatus === 'paid') return 'Paid';
            if (paymentStatus === 'failed') return 'Payment failed';
            return 'Pending payment';
        }

        if (paymentStatus === 'paid') return 'Da thanh toan';
        if (paymentStatus === 'failed') return 'Thanh toan that bai';
        return 'Chua thanh toan';
    }
}

export default BookingUtils;
