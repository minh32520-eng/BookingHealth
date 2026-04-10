'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('email_verifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            purpose: {
                type: Sequelize.STRING,
                allowNull: false
            },
            otp_hash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            verification_token: {
                type: Sequelize.STRING,
                allowNull: true
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            verified_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            consumed_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            attempts: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
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

        await queryInterface.addIndex('email_verifications', ['email', 'purpose']);
        await queryInterface.addIndex('email_verifications', ['verification_token']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('email_verifications');
    }
};
