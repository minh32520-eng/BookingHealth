import clinicService from '../services/clinicServices';

let getAllClinics = async (req, res) => {
    try {
        // Keep the controller thin and forward the request straight to the service layer.
        let response = await clinicService.getAllClinics();
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

let getDetailClinicById = async (req, res) => {
    try {
        // Clinic detail pages pass the active clinic id through query params.
        let response = await clinicService.getDetailClinicById(req.query.id);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

let createClinic = async (req, res) => {
    try {
        // Admin clinic create form already sends the full payload in req.body.
        let response = await clinicService.createClinic(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

let updateClinic = async (req, res) => {
    try {
        // Update validation stays in the service so controller code remains minimal.
        let response = await clinicService.updateClinic(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

let deleteClinic = async (req, res) => {
    try {
        // Delete uses request body id because the frontend axios helper sends it that way.
        let response = await clinicService.deleteClinic(req.body.id);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

module.exports = {
    getAllClinics,
    getDetailClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
};
