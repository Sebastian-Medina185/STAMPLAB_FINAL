'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Insumo extends Model {
    static associate(models) {
      // Relación muchos a muchos con Productos
      Insumo.belongsToMany(models.Producto, {
        through: models.ProductoInsumo,
        foreignKey: 'InsumoID',
        otherKey: 'ProductoID',
        as: 'productos'
      });

      // Relación con DetalleCompra
      Insumo.hasMany(models.DetalleCompra, {
        foreignKey: 'InsumoID',
        as: 'detallesCompra'
      });

      // Relación con CotizacionInsumo
      Insumo.hasMany(models.CotizacionInsumo, {
        foreignKey: 'InsumoID',
        as: 'cotizacionesInsumo'
      });
    }
  }

Insumo.init({
  InsumoID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
 Tipo: {
  type: DataTypes.STRING(50),
  allowNull: false,
  defaultValue: 'Otro'
},
  PrecioTela: {               // campo existente (se mantiene)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  Estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Insumo',
  tableName: 'Insumos',
  timestamps: false
});


  return Insumo;
};