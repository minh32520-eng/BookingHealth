'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1) Nếu migration cũ tạo nhầm bảng Eric thì đổi tên về Doctor_Infor
        const [tables] = await queryInterface.sequelize.query(
            "SHOW TABLES LIKE 'Eric';"
        );
        const hasEric = Array.isArray(tables) && tables.length > 0;

        const [doctorInforTables] = await queryInterface.sequelize.query(
            "SHOW TABLES LIKE 'Doctor_Infor';"
        );
        const hasDoctorInfor = Array.isArray(doctorInforTables) && doctorInforTables.length > 0;

        if (hasEric && !hasDoctorInfor) {
            await queryInterface.renameTable('Eric', 'Doctor_Infor');
            return;
        }

        // 2) Nếu không có cả 2 bảng thì tạo đúng bảng Doctor_Infor
        if (!hasDoctorInfor) {
            await queryInterface.createTable('Doctor_Infor', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                doctorId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                priceId: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                provinceId: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                paymentId: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                addressClinic: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                nameClinic: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                note: {
                    type: Sequelize.STRING,
                },
                count: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
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
        }
    },

    down: async (queryInterface) => {
        const [doctorInforTables] = await queryInterface.sequelize.query(
            "SHOW TABLES LIKE 'Doctor_Infor';"
        );
        const hasDoctorInfor = Array.isArray(doctorInforTables) && doctorInforTables.length > 0;

        if (hasDoctorInfor) {
            await queryInterface.dropTable('Doctor_Infor');
        }
    },
};

