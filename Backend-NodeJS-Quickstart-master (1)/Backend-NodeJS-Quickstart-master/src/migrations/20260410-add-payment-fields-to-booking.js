'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.addColumn('booking', 'paymentStatus', {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'pending'
            }),
            queryInterface.addColumn('booking', 'paymentMethod', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn('booking', 'paymentRef', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn('booking', 'paymentAmount', {
                type: Sequelize.INTEGER,
                allowNull: true
            }),
            queryInterface.addColumn('booking', 'paymentPayload', {
                type: Sequelize.TEXT('long'),
                allowNull: true
            })
        ]);
    },

    down: async (queryInterface) => {
        await Promise.all([
            queryInterface.removeColumn('booking', 'paymentStatus'),
            queryInterface.removeColumn('booking', 'paymentMethod'),
            queryInterface.removeColumn('booking', 'paymentRef'),
            queryInterface.removeColumn('booking', 'paymentAmount'),
            queryInterface.removeColumn('booking', 'paymentPayload')
        ]);
    }
};
