'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Specialty extends Model {
        static associate(models) {
            // define association here
            // Specialty.hasMany(models.DoctorClinicSpecialty, { foreignKey: 'specialtyId' });
        }
    }

    Specialty.init(
        {
            name: DataTypes.STRING,
            image: DataTypes.TEXT('long'),
            description: DataTypes.TEXT,
            descriptionHTML: DataTypes.TEXT('long'),
            descriptionMarkdown: DataTypes.TEXT('long')
        },
        {
            sequelize,
            modelName: 'Specialty',
            tableName: 'specialties'
        }
    );

    return Specialty;
};
