'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Handbook extends Model {
        static associate(models) {
            // define association here
        }
    }

    Handbook.init({
        title: DataTypes.STRING,
        content: DataTypes.TEXT('long'),
    }, {
        sequelize,
        modelName: 'Handbook',
        tableName: 'handbooks',
        freezeTableName: true,
    });

    return Handbook;
};

