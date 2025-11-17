'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      // Relación muchos a muchos con Colores
      Producto.belongsToMany(models.Color, { 
        through: models.ProductoColor,
        foreignKey: 'ProductoID',
        otherKey: 'ColorID',
        as: 'colores'
      });
      
      // Relación muchos a muchos con Tallas
      Producto.belongsToMany(models.Talla, { 
        through: models.ProductoTalla,
        foreignKey: 'ProductoID',
        otherKey: 'TallaID',
        as: 'tallas'
      });
      
      // Relación muchos a muchos con Insumos
      Producto.belongsToMany(models.Insumo, { 
        through: models.ProductoInsumo,
        foreignKey: 'ProductoID',
        otherKey: 'InsumoID',
        as: 'insumos'
      });
      
      // Relación con DetalleVenta
      Producto.hasMany(models.DetalleVenta, { 
        foreignKey: 'ProductoID',
        as: 'detallesVenta'
      });
      
      // Relación con CotizacionProducto
      Producto.hasMany(models.CotizacionProducto, { 
        foreignKey: 'ProductoID',
        as: 'cotizacionesProducto'
      });
    }
  }
  
  Producto.init({
    ProductoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Descripcion: DataTypes.STRING,
    ImagenProducto: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Producto',
    tableName: 'Productos',
    timestamps: false
  });
  
  return Producto;
};