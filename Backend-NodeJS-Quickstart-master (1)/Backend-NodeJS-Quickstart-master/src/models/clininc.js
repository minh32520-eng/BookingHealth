'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Clininc extends Model {
        static associate(models) {
            // define association here
        }
    };

    Clininc.init({
        name: DataTypes.STRING,
        address: DataTypes.STRING,

        description: DataTypes.TEXT,

        image: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Clininc',
        tableName: 'clininc',
        freezeTableName: true,
    });

    return Clininc;
};