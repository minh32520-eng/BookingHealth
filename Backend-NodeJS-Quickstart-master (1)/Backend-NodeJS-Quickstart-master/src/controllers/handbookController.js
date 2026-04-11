import handbookService from '../services/handbookServices';

let getAllHandbooks = async (req, res) => {
    try {
        // Keep the controller thin and forward the request straight to the service layer.
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
        // Handbook detail page reads the article id from the query string.
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
        // Admin handbook create form already sends the full payload in req.body.
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
        // Update logic stays inside the service so the controller only returns the result.
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
        // Delete uses request body id because that matches the frontend helper contract.
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
