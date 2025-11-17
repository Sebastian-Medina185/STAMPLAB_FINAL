'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cotizacion extends Model {
    static associate(models) {
      // Una cotización tiene muchos detalles
      Cotizacion.hasMany(models.DetalleCotizacion, { 
        foreignKey: 'CotizacionID',
        as: 'detalles'
      });
      
      // Pertenece a un estado
      Cotizacion.belongsTo(models.Estado, { 
        foreignKey: 'EstadoID',
        as: 'estado'
      });
    }
  }
  
  Cotizacion.init({
    CotizacionID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    FechaCotizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    ValorTotal: {
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
    modelName: 'Cotizacion',
    tableName: 'Cotizaciones',
    timestamps: false
  });
  
  return Cotizacion;
};