'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('payment_configs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            bankCode: {
                type: Sequelize.STRING,
                allowNull: true
            },
            bankName: {
                type: Sequelize.STRING,
                allowNull: true
            },
            accountNumber: {
                type: Sequelize.STRING,
                allowNull: true
            },
            accountName: {
                type: Sequelize.STRING,
                allowNull: true
            },
            defaultTransferContent: {
                type: Sequelize.STRING,
                allowNull: true
            },
            qrProvider: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'vietqr'
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('payment_configs');
    }
};
