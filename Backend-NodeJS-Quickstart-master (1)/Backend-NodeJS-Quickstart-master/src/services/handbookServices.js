const db = require('../models');

// ==================== GET ALL HANDBOOKS ====================
const getAllHandbooks = async () => {
    try {
        const data = await db.Handbook.findAll({
            attributes: ['id', 'title', 'content', 'image', 'createdAt'],
            order: [['createdAt', 'DESC']],
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

const updateHandbook = async (payload) => {
    try {
        if (!payload.id || !payload.title || !payload.content) {
            return {
                errCode: 1,
                errMessage: 'Missing parameter',
            };
        }

        const handbook = await db.Handbook.findOne({
            where: { id: payload.id },
            raw: false,
        });

        if (!handbook) {
            return {
                errCode: 2,
                errMessage: 'Handbook not found',
            };
        }

        handbook.title = payload.title;
        handbook.content = payload.content;

        if (payload.image !== undefined) {
            handbook.image = payload.image;
        }

        await handbook.save();

        return {
            errCode: 0,
            errMessage: 'ok',
        };
    } catch (e) {
        throw e;
    }
};

const deleteHandbook = async (id) => {
    try {
        if (!id) {
            return {
                errCode: 1,
                errMessage: 'Missing required parameter (id)',
            };
        }

        const handbook = await db.Handbook.findOne({
            where: { id },
            raw: false,
        });

        if (!handbook) {
            return {
                errCode: 2,
                errMessage: 'Handbook not found',
            };
        }

        await handbook.destroy();

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
    updateHandbook,
    deleteHandbook,
};
