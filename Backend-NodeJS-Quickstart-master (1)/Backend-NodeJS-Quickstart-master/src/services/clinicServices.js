const db = require('../models');

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

        const data = await db.Clininc.findOne({
            where: { id },
            raw: true,
        });

        if (!data) {
            return {
                errCode: 2,
                errMessage: 'Clinic not found',
            };
        }

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

module.exports = {
    getAllClinics,
    getDetailClinicById,
    createClinic,
};