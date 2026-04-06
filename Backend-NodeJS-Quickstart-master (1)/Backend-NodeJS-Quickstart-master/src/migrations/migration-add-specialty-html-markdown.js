'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = 'specialties';
        await queryInterface.addColumn(table, 'descriptionHTML', {
            type: Sequelize.TEXT('long'),
            allowNull: true
        });
        await queryInterface.addColumn(table, 'descriptionMarkdown', {
            type: Sequelize.TEXT('long'),
            allowNull: true
        });
    },

    down: async (queryInterface) => {
        const table = 'specialties';
        await queryInterface.removeColumn(table, 'descriptionHTML');
        await queryInterface.removeColumn(table, 'descriptionMarkdown');
    }
};
