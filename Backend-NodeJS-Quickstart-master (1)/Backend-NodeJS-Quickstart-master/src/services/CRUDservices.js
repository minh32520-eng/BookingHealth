import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (error) {
            reject(error);
        }
    });
};

const createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            const phone =
                data.phonenumber ?? data.phoneNumber ?? '';
            const positionId =
                data.positionId === '' || data.positionId === undefined
                    ? null
                    : data.positionId;

            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: phone,
                gender: data.gender,
                roleId: data.roleId,
                positionId,
            });

            resolve('OK');
        } catch (e) {
            reject(e);
        }
    });
};

const getAllUser = async () => {
    return await db.User.findAll({
        raw: true,
    });
};

const getUserInfoById = async (userId) => {
    return await db.User.findOne({
        where: { id: userId },
        raw: true,
    });
};

// const updateUserData = (data) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let user = await db.User.findOne({
//                 where: { id: data.id }
//             });

//             if (!user) {
//                 return resolve(null);
//             }

//             user.firstName = data.firstName;
//             user.lastName = data.lastName;
//             user.address = data.address;

//             await user.save();

//             let allUsers = await db.User.findAll({
//                 raw: true
//             });

//             resolve(allUsers);

//         } catch (e) {
//             reject(e);
//         }
//     });
// };
const updateUserData = async (data) => {
    const phone =
        data.phonenumber ?? data.phoneNumber ?? '';
    const positionId =
        data.positionId === '' || data.positionId === undefined
            ? null
            : data.positionId;

    await db.User.update(
        {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            phoneNumber: phone,
            gender: data.gender,
            roleId: data.roleId,
            positionId,
        },
        {
            where: { id: data.id },
        }
    );

    return await db.User.findAll({
        raw: true,
    });
};
const deleteUserById = async (userId) => {
    await db.User.destroy({
        where: { id: userId }
    });

    return true;
};

module.exports = {
    createNewUser,
    getAllUser,
    getUserInfoById,
    updateUserData,
    deleteUserById,
};
