'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Venta extends Model {
    static associate(models) {
      // Una venta pertenece a un usuario
      Venta.belongsTo(models.Usuario, { 
        foreignKey: 'DocumentoID',
        as: 'usuario'
      });
      
      // Una venta tiene muchos detalles
      Venta.hasMany(models.DetalleVenta, { 
        foreignKey: 'VentaID',
        as: 'detalles'
      });
      
      // Una venta tiene estados
      Venta.hasMany(models.Estado, { 
        foreignKey: 'VentaID',
        as: 'estados'
      });
    }
  }
  
  Venta.init({
    VentaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    DocumentoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'DocumentoID'
      }
    },
    FechaVenta: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    Subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    Total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Venta',
    tableName: 'Ventas',
    timestamps: false
  });
  
  return Venta;
};