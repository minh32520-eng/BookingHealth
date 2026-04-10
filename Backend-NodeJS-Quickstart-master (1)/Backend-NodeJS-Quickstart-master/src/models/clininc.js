'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Clininc extends Model {
        static associate(models) {
            this.hasMany(models.DoctorClinicSpecialty, {
                foreignKey: 'clinicId',
                as: 'doctorClinic'
            });
        }
    }

    Clininc.init({
        name: DataTypes.STRING,
        address: DataTypes.STRING,

        description: DataTypes.TEXT,

        image: DataTypes.TEXT('long'),
    }, {
        sequelize,
        modelName: 'Clininc',
        tableName: 'clininc',
        freezeTableName: true,
    });

    return Clininc;
};
