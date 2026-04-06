'use strict';

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

module.exports = {
  async up(queryInterface, Sequelize) {

    const hashPassword = bcrypt.hashSync('123456', salt);

    await queryInterface.bulkInsert('Users', [
      {
        userEmail: 'admin@gmail.com',
        password: hashPassword,
        firstName: 'Admin',
        lastName: 'System',
        address: 'Ha Noi',
        gender: true, // true = nam
        roleid: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: 'admin@gmail.com'
    });
  }
};
