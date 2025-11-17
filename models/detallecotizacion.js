'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DetalleCotizacion extends Model {
    static associate(models) {
      // Pertenece a un usuario
      DetalleCotizacion.belongsTo(models.Usuario, { 
        foreignKey: 'DocumentoID',
        as: 'usuario'
      });
      
      // Pertenece a una cotización
      DetalleCotizacion.belongsTo(models.Cotizacion, { 
        foreignKey: 'CotizacionID',
        as: 'cotizacion'
      });
      
      // Tiene técnicas asociadas
      DetalleCotizacion.hasMany(models.CotizacionTecnica, { 
        foreignKey: 'DetalleCotizacionID',
        as: 'tecnicas'
      });
      
      // Tiene tallas asociadas
      DetalleCotizacion.hasMany(models.CotizacionTalla, { 
        foreignKey: 'DetalleCotizacionID',
        as: 'tallas'
      });
      
      // Tiene colores asociados
      DetalleCotizacion.hasMany(models.CotizacionColor, { 
        foreignKey: 'DetalleCotizacionID',
        as: 'colores'
      });
      
      // Tiene insumos asociados
      DetalleCotizacion.hasMany(models.CotizacionInsumo, { 
        foreignKey: 'DetalleCotizacionID',
        as: 'insumos'
      });
      
      // Tiene productos asociados
      DetalleCotizacion.hasMany(models.CotizacionProducto, { 
        foreignKey: 'DetalleCotizacionID',
        as: 'productos'
      });
    }
  }
  
  DetalleCotizacion.init({
    DetalleCotizacionID: {
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
    CotizacionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cotizaciones',
        key: 'CotizacionID'
      }
    },
    Cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    TraePrenda: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    PrendaDescripcion: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DetalleCotizacion',
    tableName: 'DetalleCotizacion',
    timestamps: false
  });
  
  return DetalleCotizacion;
};