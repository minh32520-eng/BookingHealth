'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DoctorClinicSpecialty extends Model {
        static associate(models) {
            // define association here
            // DoctorClinicSpecialty.belongsTo(models.Doctor, { foreignKey: 'doctorId' });
            // DoctorClinicSpecialty.belongsTo(models.Clinic, { foreignKey: 'clinicId' });
            // DoctorClinicSpecialty.belongsTo(models.Specialty, { foreignKey: 'specialtyId' });
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
