'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DetalleVenta extends Model {
    static associate(models) {
      // Pertenece a un producto
      DetalleVenta.belongsTo(models.Producto, { 
        foreignKey: 'ProductoID',
        as: 'producto'
      });
      
      // Pertenece a una técnica
      DetalleVenta.belongsTo(models.Tecnica, { 
        foreignKey: 'TecnicaID',
        as: 'tecnica'
      });
      
      // Pertenece a una venta
      DetalleVenta.belongsTo(models.Venta, { 
        foreignKey: 'VentaID',
        as: 'venta'
      });
    }
  }
  
  DetalleVenta.init({
    DetalleVentaID: {
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
    TecnicaID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Tecnicas',
        key: 'TecnicaID'
      }
    },
    VentaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ventas',
        key: 'VentaID'
      }
    }
  }, {
    sequelize,
    modelName: 'DetalleVenta',
    tableName: 'DetalleVentas',
    timestamps: false
  });
  
  return DetalleVenta;
};