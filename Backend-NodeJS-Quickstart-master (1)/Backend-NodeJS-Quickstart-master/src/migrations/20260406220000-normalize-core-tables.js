'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Users.phonenumber must exist for model field mapping
        await queryInterface.sequelize.query(`
            ALTER TABLE Users
            ADD COLUMN IF NOT EXISTS phonenumber VARCHAR(255) NULL;
        `);

        // Ensure booking table shape matches service/model (statusId string, timetype string)
        await queryInterface.sequelize.query(`
            ALTER TABLE booking
            MODIFY COLUMN statusId VARCHAR(255) NULL,
            MODIFY COLUMN timetype VARCHAR(255) NULL;
        `);

        // Ensure specialties has required columns for current code
        await queryInterface.sequelize.query(`
            ALTER TABLE specialties
            ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS image VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS description TEXT NULL,
            ADD COLUMN IF NOT EXISTS descriptionHTML LONGTEXT NULL,
            ADD COLUMN IF NOT EXISTS descriptionMarkdown LONGTEXT NULL;
        `);

        // Create handbook table if missing (for admin handbook page)
        await queryInterface.sequelize.query(`
            CREATE TABLE IF NOT EXISTS handbooks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content LONGTEXT NOT NULL,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL
            );
        `);

        // Ensure Doctor_Infor exists (older dbs had wrong table Eric)
        const [hasEricRows] = await queryInterface.sequelize.query(`
            SELECT COUNT(*) AS total
            FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = 'Eric';
        `);
        const [hasDoctorInforRows] = await queryInterface.sequelize.query(`
            SELECT COUNT(*) AS total
            FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = 'Doctor_Infor';
        `);

        const hasEric = Number(hasEricRows?.[0]?.total || 0) > 0;
        const hasDoctorInfor = Number(hasDoctorInforRows?.[0]?.total || 0) > 0;
        if (hasEric && !hasDoctorInfor) {
            await queryInterface.renameTable('Eric', 'Doctor_Infor');
        }

        await queryInterface.sequelize.query(`
            CREATE TABLE IF NOT EXISTS Doctor_Infor (
                id INT AUTO_INCREMENT PRIMARY KEY,
                doctorId INT NOT NULL,
                priceId VARCHAR(255) NOT NULL,
                provinceId VARCHAR(255) NOT NULL,
                paymentId VARCHAR(255) NOT NULL,
                addressClinic VARCHAR(255) NOT NULL,
                nameClinic VARCHAR(255) NOT NULL,
                note VARCHAR(255) NULL,
                count INT NOT NULL DEFAULT 0,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL
            );
        `);
    },

    down: async () => {
        // no-op: this is a schema hotfix migration
    },
};

