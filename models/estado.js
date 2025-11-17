'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Estado extends Model {
    static associate(models) {
      // Pertenece a una venta
      Estado.belongsTo(models.Venta, { 
        foreignKey: 'VentaID',
        as: 'venta'
      });
      
      // Un estado tiene muchas cotizaciones
      Estado.hasMany(models.Cotizacion, { 
        foreignKey: 'EstadoID',
        as: 'cotizaciones'
      });
    }
  }
  
  Estado.init({
    EstadoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    VentaID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Ventas',
        key: 'VentaID'
      }
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Estado',
    tableName: 'Estados',
    timestamps: false
  });
  
  return Estado;
};