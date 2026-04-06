import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from "../models/index.js";


const salt = bcrypt.genSaltSync(10);

const findOrCreateOAuthUser = async ({
    provider,
    socialId,
    email,
    firstName,
    lastName,
    image
}) => {
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

        let user = await db.User.findOne({
            where: { email: email },
            attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName'],
            raw: true
        });

        if (!user) {
            return {
                errCode: 1,
                errMessage: 'User not found'
            };
        }

        let check = bcrypt.compareSync(password, user.password);

        if (!check) {
            return {
                errCode: 3,
                errMessage: 'Wrong password'
            };
        }

        delete user.password;

        return {
            errCode: 0,
            errMessage: 'OK',
            user: user
        };

    } catch (error) {
        throw error;
    }
};

const checkUserEmail = async (email) => {
    let user = await db.User.findOne({
        where: { email: email }
    });

    return !!user;
};

const createNewUser = async (data) => {
    let isExist = await checkUserEmail(data.email);

    if (isExist) {
        return {
            errCode: 1,
            errMessage: 'Email already exists'
        };
    }

    let hashPasswordFromBcrypt = hashUserPassword(data.password);

    await db.User.create({
        email: data.email,
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
                if ((!allcode || allcode.length === 0) && ['TIME', 'PRICE', 'PAYMENT', 'PROVINCE'].includes(typeInput)) {
                    const fallbackMap = {
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
    getAllUsers,
    createNewUser,
    deleteUser,
    updateUserData,
    getAllCodeService,
    saveDetailDoctor
};