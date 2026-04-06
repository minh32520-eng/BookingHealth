const db = require('../models');

const getAllHandbooks = async () => {
    try {
        const data = await db.Handbook.findAll({
            attributes: ['id', 'title', 'content'],
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

const getDetailHandbookById = async (id) => {
    try {
        if (!id) {
            return {
                errCode: 1,
                errMessage: 'Missing required parameter (id)',
            };
        }

        const data = await db.Handbook.findOne({
            where: { id },
            raw: true,
        });

        if (!data) {
            return {
                errCode: 2,
                errMessage: 'Handbook not found',
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

const createHandbook = async (payload) => {
    try {
        if (!payload.title || !payload.content) {
            return {
                errCode: 1,
                errMessage: 'Missing parameter',
            };
        }

        await db.Handbook.create({
            title: payload.title,
            content: payload.content,
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
    getAllHandbooks,
    getDetailHandbookById,
    createHandbook,
};

