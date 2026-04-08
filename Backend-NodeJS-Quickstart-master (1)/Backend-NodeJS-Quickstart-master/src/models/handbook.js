'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Handbook extends Model {
        static associate(models) {
            // define association here nếu cần
        }
    }

    Handbook.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },

        // ✅ THÊM MỚI
        image: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },

        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

    }, {
        sequelize,
        modelName: 'Handbook',
        tableName: 'handbooks',
        freezeTableName: true,
    });

    return Handbook;
};