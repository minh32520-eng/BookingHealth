'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = 'specialties';

        const tableDefinition = await queryInterface.describeTable(table);

        if (!tableDefinition.descriptionHTML) {
            await queryInterface.addColumn(table, 'descriptionHTML', {
                type: Sequelize.TEXT('long'),
                allowNull: true
            });
        }

        if (!tableDefinition.descriptionMarkdown) {
            await queryInterface.addColumn(table, 'descriptionMarkdown', {
                type: Sequelize.TEXT('long'),
                allowNull: true
            });
        }
    },

    down: async (queryInterface) => {
        const table = 'specialties';

        const tableDefinition = await queryInterface.describeTable(table);

        if (tableDefinition.descriptionHTML) {
            await queryInterface.removeColumn(table, 'descriptionHTML');
        }

        if (tableDefinition.descriptionMarkdown) {
            await queryInterface.removeColumn(table, 'descriptionMarkdown');
        }
    }
};