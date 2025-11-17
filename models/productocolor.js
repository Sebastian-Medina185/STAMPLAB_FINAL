'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductoColor extends Model {
    static associate(models) {
      // Tabla intermedia
    }
  }
  
  ProductoColor.init({
    ProductoColorID: {
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
    ColorID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Colores',
        key: 'ColorID'
      }
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ProductoColor',
    tableName: 'ProductoColor',
    timestamps: false
  });
  
  return ProductoColor;
};