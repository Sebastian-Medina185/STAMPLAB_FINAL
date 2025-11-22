'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Proveedor extends Model {
    static associate(models) {
      // Un proveedor tiene muchas compras
      Proveedor.hasMany(models.Compra, { 
        foreignKey: 'ProveedorID',
        as: 'compras'
      });
    }
  }
  
  Proveedor.init({
    Nit: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Correo: DataTypes.STRING,
    Telefono: DataTypes.STRING,
    Direccion: DataTypes.STRING,
    Estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Proveedor',
    tableName: 'proveedores',
    timestamps: false
  });
  
  return Proveedor;
};