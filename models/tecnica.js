'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tecnica extends Model {
    static associate(models) {
      // Relación con DetalleVenta
      Tecnica.hasMany(models.DetalleVenta, { 
        foreignKey: 'TecnicaID',
        as: 'detallesVenta'
      });
      
      // Relación con CotizacionTecnica
      Tecnica.hasMany(models.CotizacionTecnica, { 
        foreignKey: 'TecnicaID',
        as: 'cotizacionesTecnica'
      });
    }
  }
  
  Tecnica.init({
    TecnicaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imagenTecnica: DataTypes.STRING,
    Descripcion: DataTypes.STRING,
    Estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Tecnica',
    tableName: 'tecnicas',
    timestamps: false
  });
  
  return Tecnica;
};