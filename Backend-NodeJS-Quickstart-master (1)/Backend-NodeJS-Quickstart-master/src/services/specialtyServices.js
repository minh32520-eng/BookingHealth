const db = require('../models');
const { normalizeBase64Image } = require('../utils/image');

let getAllSpecialties = async () => {
    try {
        let data = await db.Specialty.findAll({
            attributes: ['id', 'name', 'image', 'descriptionMarkdown', 'descriptionHTML'],
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

        const clinicLinks = await db.DoctorClinicSpecialty.findAll({
            where: { specialtyId: id },
            attributes: ['clinicId'],
            include: [
                {
                    model: db.Clininc,
                    as: 'clinicData',
                    attributes: ['id', 'name', 'address', 'image']
                }
            ],
            raw: false,
            nest: true
        });

        const uniqueClinics = [];
        const seenClinicIds = new Set();

        clinicLinks.forEach((item) => {
            const plain = item.get({ plain: true });
            const clinic = plain.clinicData;
            if (!clinic || !clinic.id || seenClinicIds.has(clinic.id)) return;
            seenClinicIds.add(clinic.id);
            uniqueClinics.push(clinic);
        });

        return {
            errCode: 0,
            errMessage: 'ok',
            data: {
                ...data,
                relatedClinics: uniqueClinics
            }
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
            image: normalizeBase64Image(data.imageBase64),
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

let updateSpecialty = async (data) => {
    try {
        if (!data.id || !data.name || !data.descriptionHTML || !data.descriptionMarkdown) {
            return {
                errCode: 1,
                errMessage: 'Missing parameter'
            };
        }

        let specialty = await db.Specialty.findOne({
            where: { id: data.id },
            raw: false
        });

        if (!specialty) {
            return {
                errCode: 2,
                errMessage: 'Specialty not found'
            };
        }

        specialty.name = data.name;
        specialty.descriptionHTML = data.descriptionHTML;
        specialty.descriptionMarkdown = data.descriptionMarkdown;

        if (data.imageBase64) {
            specialty.image = normalizeBase64Image(data.imageBase64);
        }

        await specialty.save();

        return {
            errCode: 0,
            errMessage: 'ok'
        };
    } catch (e) {
        throw e;
    }
};

let deleteSpecialty = async (id) => {
    try {
        if (!id) {
            return {
                errCode: 1,
                errMessage: 'Missing required parameter (id)'
            };
        }

        let specialty = await db.Specialty.findOne({
            where: { id },
            raw: false
        });

        if (!specialty) {
            return {
                errCode: 2,
                errMessage: 'Specialty not found'
            };
        }

        await specialty.destroy();

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
    createSpecialty,
    updateSpecialty,
    deleteSpecialty
};
