'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = 'specialties';

        const [tableRows] = await queryInterface.sequelize.query(
            `SELECT COUNT(*) AS total
             FROM information_schema.tables
             WHERE table_schema = DATABASE() AND table_name = '${table}'`
        );
        const existsTable = Array.isArray(tableRows) && Number(tableRows[0]?.total || 0) > 0;
        if (!existsTable) {
            await queryInterface.createTable(table, {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                image: Sequelize.STRING,
                name: Sequelize.STRING,
                description: Sequelize.TEXT,
                descriptionHTML: Sequelize.TEXT('long'),
                descriptionMarkdown: Sequelize.TEXT('long'),
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            });
            return;
        }

        const [columnRows] = await queryInterface.sequelize.query(
            `SELECT COLUMN_NAME
             FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = '${table}'`
        );
        const cols = new Set((columnRows || []).map(r => r.COLUMN_NAME));

        if (!cols.has('name')) {
            await queryInterface.addColumn(table, 'name', { type: Sequelize.STRING, allowNull: true });
        }
        if (!cols.has('image')) {
            await queryInterface.addColumn(table, 'image', { type: Sequelize.STRING, allowNull: true });
        }
        if (!cols.has('description')) {
            await queryInterface.addColumn(table, 'description', { type: Sequelize.TEXT, allowNull: true });
        }
        if (!cols.has('descriptionHTML')) {
            await queryInterface.addColumn(table, 'descriptionHTML', { type: Sequelize.TEXT('long'), allowNull: true });
        }
        if (!cols.has('descriptionMarkdown')) {
            await queryInterface.addColumn(table, 'descriptionMarkdown', { type: Sequelize.TEXT('long'), allowNull: true });
        }
    },

    down: async () => {
        // no-op to avoid destructive schema rollback on hotfix migration
    }
};

