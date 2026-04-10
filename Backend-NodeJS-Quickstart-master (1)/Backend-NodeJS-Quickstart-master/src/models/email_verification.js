'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Email_Verification extends Model {
        static associate() { }
    }

    Email_Verification.init({
        email: DataTypes.STRING,
        purpose: DataTypes.STRING,
        otpHash: {
            type: DataTypes.STRING,
            field: 'otp_hash'
        },
        verificationToken: {
            type: DataTypes.STRING,
            field: 'verification_token'
        },
        expiresAt: {
            type: DataTypes.DATE,
            field: 'expires_at'
        },
        verifiedAt: {
            type: DataTypes.DATE,
            field: 'verified_at'
        },
        consumedAt: {
            type: DataTypes.DATE,
            field: 'consumed_at'
        },
        attempts: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Email_Verification',
        tableName: 'email_verifications',
        freezeTableName: true,
    });

    return Email_Verification;
};
