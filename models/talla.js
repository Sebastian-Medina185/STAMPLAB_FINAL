'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Talla extends Model {
    static associate(models) {
      // Relación muchos a muchos con Productos
      Talla.belongsToMany(models.Producto, { 
        through: models.ProductoTalla,
        foreignKey: 'TallaID',
        otherKey: 'ProductoID',
        as: 'productos'
      });
      
      // Relación con CotizacionTalla
      Talla.hasMany(models.CotizacionTalla, { 
        foreignKey: 'TallaID',
        as: 'cotizacionesTalla'
      });
    }
  }
  
  Talla.init({
    TallaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Precio: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Talla',
    tableName: 'Tallas',
    timestamps: false
  });
  
  return Talla;
};