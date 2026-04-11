const paymentService = require('../services/paymentServices');

let getPaymentConfig = async (req, res) => {
    try {
        // Payment config screen always reads the latest saved config from the service.
        const response = await paymentService.getPaymentConfig();
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
};

let savePaymentConfig = async (req, res) => {
    try {
        // Save receives the whole admin payment config form in req.body.
        const response = await paymentService.savePaymentConfig(req.body);
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
    getPaymentConfig,
    savePaymentConfig
};
