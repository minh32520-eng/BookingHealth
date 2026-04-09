const db = require('../models');
const { Op } = require('sequelize');

const getAllClinics = async () => {
    try {
        const data = await db.Clininc.findAll({
            attributes: ['id', 'name', 'address', 'description', 'image'],
            order: [['id', 'DESC']],
            raw: true,
        });
        return {
            errCode: 0,
            errMessage: 'ok',
            data,
        };
    } catch (e) {
        throw e;
    }
};

const getDetailClinicById = async (id) => {
    try {
        if (!id) {
            return {
                errCode: 1,
                errMessage: 'Missing required parameter (id)',
            };
        }

        const clinic = await db.Clininc.findOne({
            where: { id },
            attributes: ['id', 'name', 'address', 'description', 'image'],
            raw: true,
        });

        if (!clinic) {
            return {
                errCode: 0,
                errMessage: 'ok',
                data: {},
            };
        }

        const doctorClinicInfor = await db.Doctor_Infor.findAll({
            where: {
                [Op.or]: [
                    { nameClinic: clinic.name },
                    {
                        nameClinic: clinic.name,
                        addressClinic: clinic.address
                    }
                ]
            },
            attributes: ['doctorId'],
            include: [
                {
                    model: db.User,
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description']
                        }
                    ]
                }
            ],
            raw: false,
            nest: true,
        });

        const data = {
            ...clinic,
            doctorClinic: doctorClinicInfor.map((item) => {
                const plainItem = item.get({ plain: true });
                return {
                    doctorId: plainItem.doctorId,
                    doctorData: plainItem.User
                };
            }),
        };

        return {
            errCode: 0,
            errMessage: 'ok',
            data,
        };

    } catch (e) {
        throw e;
    }
};
const createClinic = async (payload) => {
    try {
        if (!payload.name || !payload.address || !payload.description || !payload.imageBase64) {
            return {
                errCode: 1,
                errMessage: 'Missing parameter',
            };
        }

        await db.Clininc.create({
            name: payload.name,
            address: payload.address,
            description: payload.description,
            image: payload.imageBase64,
        });

        return {
            errCode: 0,
            errMessage: 'ok',
        };
    } catch (e) {
        throw e;
    }
};

const updateClinic = async (payload) => {
    try {
        if (!payload.id || !payload.name || !payload.address || !payload.description) {
            return {
                errCode: 1,
                errMessage: 'Missing parameter',
            };
        }

        const clinic = await db.Clininc.findOne({
            where: { id: payload.id },
            raw: false,
        });

        if (!clinic) {
            return {
                errCode: 2,
                errMessage: 'Clinic not found',
            };
        }

        clinic.name = payload.name;
        clinic.address = payload.address;
        clinic.description = payload.description;

        if (payload.imageBase64) {
            clinic.image = payload.imageBase64;
        }

        await clinic.save();

        return {
            errCode: 0,
            errMessage: 'ok',
        };
    } catch (e) {
        throw e;
    }
};

const deleteClinic = async (id) => {
    try {
        if (!id) {
            return {
                errCode: 1,
                errMessage: 'Missing required parameter (id)',
            };
        }

        const clinic = await db.Clininc.findOne({
            where: { id },
            raw: false,
        });

        if (!clinic) {
            return {
                errCode: 2,
                errMessage: 'Clinic not found',
            };
        }

        await clinic.destroy();

        return {
            errCode: 0,
            errMessage: 'ok',
        };
    } catch (e) {
        throw e;
    }
};

module.exports = {
    getAllClinics,
    getDetailClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
};
