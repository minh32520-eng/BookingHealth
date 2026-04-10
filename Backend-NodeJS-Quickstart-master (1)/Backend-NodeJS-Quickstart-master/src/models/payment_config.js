'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Payment_Config extends Model {
        static associate() {}
    }

    Payment_Config.init({
        bankCode: DataTypes.STRING,
        bankName: DataTypes.STRING,
        accountNumber: DataTypes.STRING,
        accountName: DataTypes.STRING,
        defaultTransferContent: DataTypes.STRING,
        qrProvider: DataTypes.STRING,
        isActive: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Payment_Config',
        tableName: 'payment_configs',
        freezeTableName: true,
    });

    return Payment_Config;
};
