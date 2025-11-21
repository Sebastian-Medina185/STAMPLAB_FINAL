'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductoInsumo extends Model {
    static associate(models) {
      // Tabla intermedia
    }
  }
  
  ProductoInsumo.init({
    ProductoInsumoID: {
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
    InsumoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Insumos',
        key: 'InsumoID'
      }
    }
  }, {
    sequelize,
    modelName: 'ProductoInsumo',
    tableName: 'productoinsumo',
    timestamps: false
  });
  
  return ProductoInsumo;
};