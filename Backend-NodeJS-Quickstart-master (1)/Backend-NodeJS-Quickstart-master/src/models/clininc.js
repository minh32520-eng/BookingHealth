'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Clininc extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Clininc.init({
        name: DataTypes.STRING,
        address: DataTypes.STRING,
        description: DataTypes.STRING,
        image: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'clininc',
        tableName: 'clininc',
        freezeTableName: true,
    });
    return Clininc;
};