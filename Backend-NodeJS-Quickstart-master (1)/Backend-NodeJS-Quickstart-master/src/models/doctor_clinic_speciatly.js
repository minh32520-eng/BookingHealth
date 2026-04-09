'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DoctorClinicSpecialty extends Model {
        static associate(models) {
            this.belongsTo(models.User, {
                foreignKey: 'doctorId',
                as: 'doctorData'
            });

            this.belongsTo(models.Clininc, {
                foreignKey: 'clinicId',
                as: 'clinicData'
            });

            this.belongsTo(models.Specialty, {
                foreignKey: 'specialtyId',
                as: 'specialtyData'
            });
        }
    }

    DoctorClinicSpecialty.init(
        {
            doctorId: DataTypes.INTEGER,
            clinicId: DataTypes.INTEGER,
            specialtyId: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'DoctorClinicSpecialty',
            tableName: 'Doctor_Clinic_Specialties'
        }
    );

    return DoctorClinicSpecialty;
};
