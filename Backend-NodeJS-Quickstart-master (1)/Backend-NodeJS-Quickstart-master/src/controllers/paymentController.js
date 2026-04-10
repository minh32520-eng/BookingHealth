const paymentService = require('../services/paymentServices');

let getPaymentConfig = async (req, res) => {
    try {
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
