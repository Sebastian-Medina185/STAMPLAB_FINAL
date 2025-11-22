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
    },
    PrecioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Precio al que se compró'
    }
  }, {
    sequelize,
    modelName: 'DetalleCompra',
    tableName: 'detallecompra',
    timestamps: false
  });
  
  return DetalleCompra;
};