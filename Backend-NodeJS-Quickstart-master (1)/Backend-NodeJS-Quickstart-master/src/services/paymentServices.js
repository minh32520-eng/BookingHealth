const db = require('../models');

const getPaymentConfig = async () => {
    const config = await db.Payment_Config.findOne({
        order: [['updatedAt', 'DESC']],
        raw: true
    });

    return {
        errCode: 0,
        errMessage: 'OK',
        data: config || {}
    };
};

const savePaymentConfig = async (inputData) => {
    if (!inputData.accountNumber || !inputData.accountName) {
        return {
            errCode: 1,
            errMessage: 'Missing required parameter'
        };
    }

    let config = await db.Payment_Config.findOne({
        order: [['updatedAt', 'DESC']],
        raw: false
    });

    if (!config) {
        config = await db.Payment_Config.create({
            bankCode: inputData.bankCode || '',
            bankName: inputData.bankName || '',
            accountNumber: inputData.accountNumber,
            accountName: inputData.accountName,
            defaultTransferContent: inputData.defaultTransferContent || '',
            qrProvider: inputData.qrProvider || 'vietqr',
            isActive: inputData.isActive !== false
        });
    } else {
        config.bankCode = inputData.bankCode || '';
        config.bankName = inputData.bankName || '';
        config.accountNumber = inputData.accountNumber;
        config.accountName = inputData.accountName;
        config.defaultTransferContent = inputData.defaultTransferContent || '';
        config.qrProvider = inputData.qrProvider || 'vietqr';
        config.isActive = inputData.isActive !== false;
        await config.save();
    }

    return {
        errCode: 0,
        errMessage: 'Save payment config succeed',
        data: config.get({ plain: true })
    };
};

module.exports = {
    getPaymentConfig,
    savePaymentConfig
};
