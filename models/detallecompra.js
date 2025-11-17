'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DetalleCompra extends Model {
    static associate(models) {
      // Pertenece a una compra
      DetalleCompra.belongsTo(models.Compra, { 
        foreignKey: 'CompraID',
        as: 'compra'
      });
      
      // Pertenece a un insumo
      DetalleCompra.belongsTo(models.Insumo, { 
        foreignKey: 'InsumoID',
        as: 'insumo'
      });
    }
  }
  
  DetalleCompra.init({
    DetalleCompraID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CompraID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Compras',
        key: 'CompraID'
      }
    },
    InsumoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Insumos',
        key: 'InsumoID'
      }
    },
    Cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'DetalleCompra',
    tableName: 'DetalleCompra',
    timestamps: false
  });
  
  return DetalleCompra;
};