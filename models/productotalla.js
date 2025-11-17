'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductoTalla extends Model {
    static associate(models) {
      // Tabla intermedia
    }
  }
  
  ProductoTalla.init({
    ProductoTallaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ProductoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Productos',
        key: 'ProductoID'
      }
    },
    TallaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tallas',
        key: 'TallaID'
      }
    },
    StockDisponible: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ProductoTalla',
    tableName: 'ProductoTalla',
    timestamps: false
  });
  
  return ProductoTalla;
};