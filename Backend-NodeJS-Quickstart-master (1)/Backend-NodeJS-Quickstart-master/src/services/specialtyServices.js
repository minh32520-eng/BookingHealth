const db = require('../models');

let getAllSpecialties = async () => {
    try {
        let data = await db.Specialty.findAll({
            attributes: ['id', 'name', 'image'],
            order: [['id', 'ASC']],
            raw: true
        });
        return {
            errCode: 0,
            errMessage: 'ok',
            data
        };
    } catch (e) {
        throw e;
    }
};

let getDetailSpecialtyById = async (id) => {
    try {
        if (!id) {
            return {
                errCode: 1,
                errMessage: 'Missing required parameter (id)'
            };
        }
        let data = await db.Specialty.findOne({
            where: { id },
            raw: true
        });

        if (!data) {
            return {
                errCode: 2,
                errMessage: 'Specialty not found'
            };
        }

        return {
            errCode: 0,
            errMessage: 'ok',
            data
        };
    } catch (e) {
        throw e;
    }
};

let createSpecialty = async (data) => {
    try {
        if (!data.name
            || !data.imageBase64
            || !data.descriptionHTML
            || !data.descriptionMarkdown
        ) {
            return {
                errCode: 1,
                errMessage: 'Missing parameter'
            };
        }

        await db.Specialty.create({
            name: data.name,
            image: data.imageBase64,
            descriptionHTML: data.descriptionHTML,
            descriptionMarkdown: data.descriptionMarkdown
        });

        return {
            errCode: 0,
            errMessage: 'ok'
        };

    } catch (e) {
        throw e;
    }
};

module.exports = {
    getAllSpecialties,
    getDetailSpecialtyById,
    createSpecialty
};