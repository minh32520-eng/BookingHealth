const db = require('../models');

const getPaymentConfig = async () => {
    // Always read the newest config because the admin screen edits a single active payment profile.
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
    // Account number and account name are the absolute minimum required to produce a valid bank transfer target.
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
        // Create the first config record the first time the admin saves payment settings.
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
        // Update the latest config in place so old booking previews keep using one active source of truth.
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
