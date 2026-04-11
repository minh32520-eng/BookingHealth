import specialtyService from '../services/specialtyServices';

let getAllSpecialties = async (req, res) => {
    try {
        // Keep the controller thin and forward the request straight to the service layer.
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
        // Read the specialty id from query params because this endpoint is used by detail pages.
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
        // Admin specialty create form already sends the full payload in req.body.
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

let updateSpecialty = async (req, res) => {
    try {
        // Update logic stays in the service so controller code remains minimal and predictable.
        let response = await specialtyService.updateSpecialty(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
};

let deleteSpecialty = async (req, res) => {
    try {
        // Delete receives the id from request body to match the existing frontend service shape.
        let response = await specialtyService.deleteSpecialty(req.body.id);
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
    createSpecialty,
    updateSpecialty,
    deleteSpecialty
};
