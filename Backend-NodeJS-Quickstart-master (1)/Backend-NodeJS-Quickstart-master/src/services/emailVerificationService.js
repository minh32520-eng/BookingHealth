import crypto from 'crypto';
import moment from 'moment';
import db from '../models/index';
import emailService from './email.Service';

const OTP_EXPIRE_MINUTES = 10;
const SUPPORTED_PURPOSES = ['register', 'forgot_password', 'booking'];

const normalizeEmail = (email) => {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
};

const isValidGmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
};

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const createOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const getPurposeLabel = (purpose) => {
    const labels = {
        register: 'đăng ký tài khoản',
        forgot_password: 'đổi mật khẩu',
        booking: 'đặt lịch khám'
    };

    return labels[purpose] || 'xác minh email';
};

const sendOtp = async ({ email, purpose }) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !purpose) {
        return {
            errCode: 1,
            errMessage: 'Missing required parameters'
        };
    }

    if (!SUPPORTED_PURPOSES.includes(purpose)) {
        return {
            errCode: 2,
            errMessage: 'Unsupported verification purpose'
        };
    }

    if (!isValidGmail(normalizedEmail)) {
        return {
            errCode: 3,
            errMessage: 'Only existing Gmail addresses are supported'
        };
    }

    const otpCode = createOtpCode();

    await db.Email_Verification.update(
        { consumedAt: new Date() },
        {
            where: {
                email: normalizedEmail,
                purpose,
                consumedAt: null
            }
        }
    );

    await db.Email_Verification.create({
        email: normalizedEmail,
        purpose,
        otpHash: hashOtp(otpCode),
        expiresAt: moment().add(OTP_EXPIRE_MINUTES, 'minutes').toDate(),
        attempts: 0
    });

    await emailService.sendOtpEmail({
        reciverEmail: normalizedEmail,
        otpCode,
        purposeLabel: getPurposeLabel(purpose),
        expireMinutes: OTP_EXPIRE_MINUTES
    });

    return {
        errCode: 0,
        errMessage: 'OTP sent successfully'
    };
};

const verifyOtp = async ({ email, purpose, otpCode }) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !purpose || !otpCode) {
        return {
            errCode: 1,
            errMessage: 'Missing required parameters'
        };
    }

    const verification = await db.Email_Verification.findOne({
        where: {
            email: normalizedEmail,
            purpose,
            consumedAt: null
        },
        order: [['createdAt', 'DESC']],
        raw: false
    });

    if (!verification) {
        return {
            errCode: 2,
            errMessage: 'Verification request not found'
        };
    }

    if (verification.expiresAt && moment(verification.expiresAt).valueOf() < moment().valueOf()) {
        return {
            errCode: 3,
            errMessage: 'OTP has expired'
        };
    }

    if (verification.otpHash !== hashOtp(otpCode)) {
        verification.attempts = (verification.attempts || 0) + 1;
        await verification.save();

        return {
            errCode: 4,
            errMessage: 'OTP is invalid'
        };
    }

    const verificationToken = crypto.randomBytes(24).toString('hex');
    verification.verifiedAt = new Date();
    verification.verificationToken = verificationToken;
    await verification.save();

    return {
        errCode: 0,
        errMessage: 'OTP verified successfully',
        data: {
            verificationToken
        }
    };
};

const consumeVerifiedToken = async ({ email, purpose, verificationToken }) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !purpose || !verificationToken) {
        return {
            errCode: 1,
            errMessage: 'Missing required parameters'
        };
    }

    const verification = await db.Email_Verification.findOne({
        where: {
            email: normalizedEmail,
            purpose,
            verificationToken,
            consumedAt: null
        },
        order: [['createdAt', 'DESC']],
        raw: false
    });

    if (!verification || !verification.verifiedAt) {
        return {
            errCode: 2,
            errMessage: 'Email has not been verified'
        };
    }

    if (verification.expiresAt && moment(verification.expiresAt).valueOf() < moment().valueOf()) {
        return {
            errCode: 3,
            errMessage: 'Verification token has expired'
        };
    }

    verification.consumedAt = new Date();
    await verification.save();

    return {
        errCode: 0,
        errMessage: 'Verification token accepted'
    };
};

module.exports = {
    normalizeEmail,
    isValidGmail,
    sendOtp,
    verifyOtp,
    consumeVerifiedToken
};
