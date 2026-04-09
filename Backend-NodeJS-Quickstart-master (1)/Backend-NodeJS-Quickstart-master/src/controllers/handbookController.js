import handbookService from '../services/handbookServices';

let getAllHandbooks = async (req, res) => {
    try {
        let response = await handbookService.getAllHandbooks();
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

let getDetailHandbookById = async (req, res) => {
    try {
        let response = await handbookService.getDetailHandbookById(req.query.id);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

let createHandbook = async (req, res) => {
    try {
        let response = await handbookService.createHandbook(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

let updateHandbook = async (req, res) => {
    try {
        let response = await handbookService.updateHandbook(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server',
        });
    }
};

let deleteHandbook = async (req, res) => {
    try {
        let response = await handbookService.deleteHandbook(req.body.id);
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
    getAllHandbooks,
    getDetailHandbookById,
    createHandbook,
    updateHandbook,
    deleteHandbook,
};
