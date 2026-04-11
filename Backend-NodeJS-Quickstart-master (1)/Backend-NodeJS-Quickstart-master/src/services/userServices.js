import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from "../models/index.js";
import emailVerificationService from './emailVerificationService.js';


const salt = bcrypt.genSaltSync(10);

const normalizeEmail = (email) => {
    return emailVerificationService.normalizeEmail(email);
};

const findOrCreateOAuthUser = async ({
    provider,
    socialId,
    email,
    firstName,
    lastName,
    image
}) => {
    // Social login always lands in the same user table.
    // First try the provider account, then reuse an existing local account by email.
    const defaultRole = process.env.OAUTH_DEFAULT_ROLE_ID || 'R3';

    const socialUser = await db.User.findOne({
        where: { authProvider: provider, socialId: String(socialId) },
        raw: true
    });

    if (socialUser) {
        const safe = { ...socialUser };
        delete safe.password;
        return { errCode: 0, errMessage: 'OK', user: safe };
    }

    if (email) {
        const byEmail = await db.User.findOne({
            where: { email },
            raw: false
        });
        if (byEmail) {
            // Link the existing account to the provider instead of creating a duplicate user.
            byEmail.authProvider = provider;
            byEmail.socialId = String(socialId);
            if (image) byEmail.image = image;
            await byEmail.save();
            const fresh = await db.User.findByPk(byEmail.id, {
                attributes: { exclude: ['password'] },
                raw: true
            });
            return { errCode: 0, errMessage: 'OK', user: fresh };
        }
    }

    const finalEmail =
        email ||
        `${provider}_${socialId}@oauth.local`.toLowerCase();

    const exists = await checkUserEmail(finalEmail);
    if (exists) {
        const u = await db.User.findOne({ where: { email: finalEmail }, raw: false });
        u.authProvider = provider;
        u.socialId = String(socialId);
        await u.save();
        const fresh = await db.User.findByPk(u.id, {
            attributes: { exclude: ['password'] },
            raw: true
        });
        return { errCode: 0, errMessage: 'OK', user: fresh };
    }

    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashPasswordFromBcrypt = hashUserPassword(randomPassword);

    await db.User.create({
        email: finalEmail,
        password: hashPasswordFromBcrypt,
        firstName: firstName || provider,
        lastName: lastName || 'User',
        address: '',
        phonenumber: '',
        gender: 'M',
        roleId: defaultRole,
        positionId: 'P0',
        image: image || '',
        authProvider: provider,
        socialId: String(socialId)
    });

    const created = await db.User.findOne({
        where: { email: finalEmail },
        attributes: { exclude: ['password'] },
        raw: true
    });

    return { errCode: 0, errMessage: 'OK', user: created };
};

const hashUserPassword = (password) => {
    return bcrypt.hashSync(password, salt);
};

const handleUserLogin = async (email, password) => {
    try {
        const normalizedEmail = normalizeEmail(email);

        let user = await db.User.findOne({
            where: { email: normalizedEmail },
            attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName', 'phoneNumber', 'address', 'gender'],
            raw: false
        });

        if (!user) {
            return {
                errCode: 1,
                errMessage: 'User not found'
            };
        }

        // OAuth-only accounts may not have a usable password for classic login.
        const passwordHash = typeof user.password === 'string' ? user.password : '';
        if (!passwordHash) {
            return {
                errCode: 2,
                errMessage: 'This account cannot log in with password'
            };
        }

        let check = bcrypt.compareSync(password, passwordHash);

        if (!check) {
            return {
                errCode: 3,
                errMessage: 'Wrong password'
            };
        }

        const safeUser = user.get ? user.get({ plain: true }) : user;
        delete safeUser.password;

        return {
            errCode: 0,
            errMessage: 'OK',
            user: safeUser
        };

    } catch (error) {
        throw error;
    }
};

const checkUserEmail = async (email) => {
    const normalizedEmail = normalizeEmail(email);
    let user = await db.User.findOne({
        where: { email: normalizedEmail }
    });

    return !!user;
};

const createNewUser = async (data) => {
    const normalizedEmail = normalizeEmail(data.email);
    let isExist = await checkUserEmail(normalizedEmail);

    if (isExist) {
        return {
            errCode: 1,
            errMessage: 'Email already exists'
        };
    }

    let hashPasswordFromBcrypt = hashUserPassword(data.password);

    await db.User.create({
        email: normalizedEmail,
        password: hashPasswordFromBcrypt,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phonenumber: data.phoneNumber || data.phonenumber,
        gender: data.gender,
        roleId: data.roleId,
        positionId: data.positionId,
        image: data.avatar
    });
    return {
        errCode: 0,
        errMessage: 'User created successfully'
    };
};

const registerNewPatient = async (data) => {
    const normalizedEmail = normalizeEmail(data.email);

    if (!data.email || !data.password || !data.firstName || !data.lastName || !data.verificationToken) {
        return {
            errCode: 1,
            errMessage: 'Missing required parameters'
        };
    }

    if (!emailVerificationService.isValidGmail(normalizedEmail)) {
        return {
            errCode: 3,
            errMessage: 'Please use a valid Gmail address'
        };
    }

    let isExist = await checkUserEmail(normalizedEmail);

    if (isExist) {
        return {
            errCode: 2,
            errMessage: 'Email already exists'
        };
    }

    // Consume the verification token here so one verified OTP cannot be reused for many accounts.
    const verificationResult = await emailVerificationService.consumeVerifiedToken({
        email: normalizedEmail,
        purpose: 'register',
        verificationToken: data.verificationToken
    });

    if (verificationResult.errCode !== 0) {
        return verificationResult;
    }

    let hashPasswordFromBcrypt = hashUserPassword(data.password);

    await db.User.create({
        email: normalizedEmail,
        password: hashPasswordFromBcrypt,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address || '',
        phonenumber: data.phoneNumber || '',
        gender: data.gender || 'M',
        roleId: 'R3',
        positionId: data.positionId || 'P0',
        image: ''
    });

    return {
        errCode: 0,
        errMessage: 'Register successfully'
    };
};

const forgotPassword = async (data) => {
    const normalizedEmail = normalizeEmail(data.email);

    if (!data.email || !data.newPassword || !data.verificationToken) {
        return {
            errCode: 1,
            errMessage: 'Missing required parameters'
        };
    }

    if (!emailVerificationService.isValidGmail(normalizedEmail)) {
        return {
            errCode: 3,
            errMessage: 'Please use a valid Gmail address'
        };
    }

    let user = await db.User.findOne({
        where: { email: normalizedEmail },
        raw: false
    });

    if (!user) {
        return {
            errCode: 2,
            errMessage: 'Email does not exist'
        };
    }

    // The OTP token is single-use, so password reset only succeeds once per verified session.
    const verificationResult = await emailVerificationService.consumeVerifiedToken({
        email: normalizedEmail,
        purpose: 'forgot_password',
        verificationToken: data.verificationToken
    });

    if (verificationResult.errCode !== 0) {
        return verificationResult;
    }

    user.password = hashUserPassword(data.newPassword);
    await user.save();

    return {
        errCode: 0,
        errMessage: 'Password updated successfully'
    };
};

const sendEmailOtp = async (data) => {
    return emailVerificationService.sendOtp(data);
};

const verifyEmailOtp = async (data) => {
    return emailVerificationService.verifyOtp(data);
};

const getAllUsers = async (userId) => {

    if (userId === 'ALL') {

        return await db.User.findAll({
            attributes: { exclude: ['password'] }
        });

    }

    return await db.User.findOne({
        where: { id: userId },
        attributes: { exclude: ['password'] }
    });

};

const deleteUser = async (id) => {

    let foundUser = await db.User.findOne({
        where: { id: id }
    });

    if (!foundUser) {
        return {
            errCode: 2,
            errMessage: 'User not found'
        };
    }

    await db.User.destroy({
        where: { id: id }
    });

    return {
        errCode: 0,
        errMessage: 'User deleted successfully'
    };
};

const updateUserData = async (data) => {

    if (!data.id) {
        return {
            errCode: 2,
            errMessage: 'Missing required parameters'
        };
    }

    let user = await db.User.findOne({
        where: { id: data.id }
    });

    if (!user) {
        return {
            errCode: 1,
            errMessage: 'User not found'
        };
    }

    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.address = data.address;
    user.roleId = data.roleId;
    user.positionId = data.positionId;
    user.gender = data.gender;
    user.phonenumber = data.phonenumber;

    if (data.avatar) {
        user.image = data.avatar;
    }

    await user.save();

    return {
        errCode: 0,
        errMessage: 'Update success'
    };

};

const saveDetailDoctor = (data) => {
    return axios.post('/api/save-info-doctors', data)
};

let getAllCodeService = (typeInput) => {

    return new Promise(async (resolve, reject) => {

        try {

            let res = {};

            if (!typeInput) {

                res.errCode = 1;
                res.errMessage = 'Missing required parameter';

            } else {

                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });

                // Fallback dữ liệu cho ManageDoctor khi DB chưa seed đủ allcode
                if ((!allcode || allcode.length === 0) && ['GENDER', 'TIME', 'PRICE', 'PAYMENT', 'PROVINCE'].includes(typeInput)) {
                    const fallbackMap = {
                        GENDER: [
                            { keyMap: 'M', type: 'GENDER', valueEn: 'Male', valueVi: 'Nam' },
                            { keyMap: 'F', type: 'GENDER', valueEn: 'Female', valueVi: 'Nu' },
                            { keyMap: 'O', type: 'GENDER', valueEn: 'Other', valueVi: 'Khac' },
                        ],
                        TIME: [
                            { keyMap: 'T1', type: 'TIME', valueEn: '08:00', valueVi: '08:00' },
                            { keyMap: 'T2', type: 'TIME', valueEn: '09:00', valueVi: '09:00' },
                            { keyMap: 'T3', type: 'TIME', valueEn: '10:00', valueVi: '10:00' },
                        ],
                        PRICE: [
                            { keyMap: 'PR1', type: 'PRICE', valueEn: '20', valueVi: '200000' },
                            { keyMap: 'PR2', type: 'PRICE', valueEn: '30', valueVi: '300000' },
                            { keyMap: 'PR3', type: 'PRICE', valueEn: '50', valueVi: '500000' },
                        ],
                        PAYMENT: [
                            { keyMap: 'PAY1', type: 'PAYMENT', valueEn: 'Cash', valueVi: 'Tiền mặt' },
                            { keyMap: 'PAY2', type: 'PAYMENT', valueEn: 'Transfer', valueVi: 'Chuyển khoản' },
                        ],
                        PROVINCE: [
                            { keyMap: 'PROV1', type: 'PROVINCE', valueEn: 'Hanoi', valueVi: 'Hà Nội' },
                            { keyMap: 'PROV2', type: 'PROVINCE', valueEn: 'Da Nang', valueVi: 'Đà Nẵng' },
                            { keyMap: 'PROV3', type: 'PROVINCE', valueEn: 'Ho Chi Minh', valueVi: 'TP.HCM' },
                        ]
                    };
                    allcode = fallbackMap[typeInput] || [];
                }

                res.errCode = 0;
                res.data = allcode;

            }

            resolve(res);

        } catch (error) {

            reject(error);

        }

    });

};

export default {
    handleUserLogin,
    findOrCreateOAuthUser,
    sendEmailOtp,
    verifyEmailOtp,
    getAllUsers,
    createNewUser,
    registerNewPatient,
    forgotPassword,
    deleteUser,
    updateUserData,
    getAllCodeService,
    saveDetailDoctor
};



