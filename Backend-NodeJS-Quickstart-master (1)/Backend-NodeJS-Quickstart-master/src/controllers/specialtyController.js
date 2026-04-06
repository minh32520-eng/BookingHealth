import specialtyService from '../services/specialtyServices';

let getAllSpecialties = async (req, res) => {
    try {
        let response = await specialtyService.getAllSpecialties();
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
};

let getDetailSpecialtyById = async (req, res) => {
    try {
        let response = await specialtyService.getDetailSpecialtyById(
            req.query.id
        );
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
};

let createSpecialty = async (req, res) => {
    try {
        let response = await specialtyService.createSpecialty(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
};

module.exports = {
    getAllSpecialties,
    getDetailSpecialtyById,
    createSpecialty
};
