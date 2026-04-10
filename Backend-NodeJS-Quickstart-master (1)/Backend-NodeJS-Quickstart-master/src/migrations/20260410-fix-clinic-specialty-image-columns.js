'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const alterIfExists = async (tableName, columnName) => {
            const [rows] = await queryInterface.sequelize.query(
                `SELECT COLUMN_NAME
                 FROM information_schema.columns
                 WHERE table_schema = DATABASE()
                   AND table_name = '${tableName}'
                   AND column_name = '${columnName}'`
            );

            if (!Array.isArray(rows) || rows.length === 0) {
                return;
            }

            await queryInterface.changeColumn(tableName, columnName, {
                type: Sequelize.TEXT('long'),
                allowNull: true
            });
        };

        await alterIfExists('specialties', 'image');
        await alterIfExists('clininc', 'image');
    },

    down: async () => {
        // no-op to avoid destructive rollback of image data columns
    }
};
