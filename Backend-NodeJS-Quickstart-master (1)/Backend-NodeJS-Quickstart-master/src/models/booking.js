'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Booking.init({
        statusId: DataTypes.STRING,
        paymentStatus: DataTypes.STRING,
        paymentMethod: DataTypes.STRING,
        paymentRef: DataTypes.STRING,
        paymentAmount: DataTypes.INTEGER,
        paymentPayload: DataTypes.TEXT,
        doctorId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        date: DataTypes.STRING,
        timeType: {
            type: DataTypes.STRING,
            field: 'timetype'
        },
        token: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Booking',
        tableName: 'booking',
        freezeTableName: true,
    });
    return Booking;
};
