'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Color extends Model {
    static associate(models) {
      // Relación muchos a muchos con Productos
      Color.belongsToMany(models.Producto, { 
        through: models.ProductoColor,
        foreignKey: 'ColorID',
        otherKey: 'ProductoID',
        as: 'productos'
      });
      
      // Relación con CotizacionColor
      Color.hasMany(models.CotizacionColor, { 
        foreignKey: 'ColorID',
        as: 'cotizacionesColor'
      });
    }
  }
  
  Color.init({
    ColorID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Cantidad: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Color',
    tableName: 'Colores',
    timestamps: false
  });
  
  return Color;
};