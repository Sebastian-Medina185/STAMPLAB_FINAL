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
      
      // Una venta pertenece a un estado
      Venta.belongsTo(models.Estado, { 
        foreignKey: 'EstadoID',
        as: 'estado'
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
    Subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    Total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    EstadoID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Estados',
        key: 'EstadoID'
      }
    }
  }, {
    sequelize,
    modelName: 'Venta',
    tableName: 'ventas',
    timestamps: false
  });
  
  return Venta;
};