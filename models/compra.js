'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Compra extends Model {
    static associate(models) {
      // Una compra pertenece a un proveedor
      Compra.belongsTo(models.Proveedor, { 
        foreignKey: 'ProveedorID',
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
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Proveedores',
        key: 'Nit'
      }
    },
    FechaCompra: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    Estado: {
      type: DataTypes.STRING,
      defaultValue: 'pendiente'
    }
  }, {
    sequelize,
    modelName: 'Compra',
    tableName: 'Compras',
    timestamps: false
  });
  
  return Compra;
};