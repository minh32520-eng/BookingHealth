'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('handbooks', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT('long'),
                allowNull: false,
            },


            image: {
                type: Sequelize.TEXT('long'),
                allowNull: true,
            },
            views: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('handbooks');
    },
};