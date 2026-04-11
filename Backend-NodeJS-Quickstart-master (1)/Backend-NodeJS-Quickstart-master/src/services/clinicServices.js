const db = require('../models');
const { normalizeBase64Image } = require('../utils/image');

const getAllClinics = async () => {
    try {
        // Keep the list query light because homepage cards and admin tables only need summary fields.
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
                // Match by clinic name/address because older doctor info rows were saved without a real clinic id.
                nameClinic: clinic.name
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

        const specialtyLinks = await db.DoctorClinicSpecialty.findAll({
            where: { clinicId: id },
            include: [
                {
                    model: db.Specialty,
                    as: 'specialtyData',
                    attributes: ['id', 'name', 'image']
                }
            ],
            raw: false,
            nest: true,
        });

        const relatedSpecialtiesMap = new Map();
        specialtyLinks.forEach((item) => {
            const specialty = item?.specialtyData?.get
                ? item.specialtyData.get({ plain: true })
                : item?.specialtyData;

            // Deduplicate specialties because multiple doctors in one clinic can point to the same specialty.
            if (specialty && specialty.id && !relatedSpecialtiesMap.has(specialty.id)) {
                relatedSpecialtiesMap.set(specialty.id, specialty);
            }
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
            relatedSpecialties: Array.from(relatedSpecialtiesMap.values()),
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
            // Normalize uploaded base64 so frontend pages can render clinic images consistently later.
            image: normalizeBase64Image(payload.imageBase64),
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
            clinic.image = normalizeBase64Image(payload.imageBase64);
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
