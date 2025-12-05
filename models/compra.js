'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Compra extends Model {
    static associate(models) {
      // Una compra pertenece a un proveedor mediante ProveedorRefId
      Compra.belongsTo(models.Proveedor, { 
        foreignKey: 'ProveedorRefId',
        targetKey: 'id',
        as: 'proveedor'
      });
      
      // Una compra tiene muchos detalles
      Compra.hasMany(models.DetalleCompra, { 
        foreignKey: 'CompraID',
        as: 'detalles'
      });
    }
  }
  
  Compra.init({
    CompraID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ProveedorID: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ProveedorRefId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proveedores',
        key: 'id'
      }
    },
    FechaCompra: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Compra',
    tableName: 'compras',
    timestamps: false
  });
  
  return Compra;
};