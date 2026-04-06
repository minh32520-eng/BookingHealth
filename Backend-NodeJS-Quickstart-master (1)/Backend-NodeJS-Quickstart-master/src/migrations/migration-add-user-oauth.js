'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = 'Users';
        await queryInterface.addColumn(table, 'authProvider', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn(table, 'socialId', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface) => {
        const table = 'Users';
        await queryInterface.removeColumn(table, 'authProvider');
        await queryInterface.removeColumn(table, 'socialId');
    }
};
