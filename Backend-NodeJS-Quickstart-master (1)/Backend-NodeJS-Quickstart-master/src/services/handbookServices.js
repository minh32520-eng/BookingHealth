const db = require('../models');

// ==================== GET ALL HANDBOOKS ====================
const getAllHandbooks = async () => {
    try {
        const data = await db.Handbook.findAll({
            attributes: ['id', 'title', 'image', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 5, // lấy 5 bài mới nhất
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

// ==================== GET DETAIL ====================
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
            attributes: ['id', 'title', 'content', 'image'],
            raw: true,
        });

        if (!data) {
            return {
                errCode: 2,
                errMessage: 'Handbook not found',
            };
        }

        // tăng view (optional - xịn hơn)
        await db.Handbook.increment('views', { where: { id } });

        return {
            errCode: 0,
            errMessage: 'ok',
            data,
        };
    } catch (e) {
        throw e;
    }
};

// ==================== CREATE ====================
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
            image: payload.image || null, // thêm image
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