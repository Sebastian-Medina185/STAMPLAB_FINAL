'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Compra extends Model {
    static associate(models) {
      // Una compra pertenece a un proveedor mediante ProveedorRefId
      Compra.belongsTo(models.Proveedor, { 
        foreignKey: 'ProveedorRefId',
        targetKey: 'id',
        as: 'proveedor'
      });
      
      // Una compra tiene muchos detalles
      Compra.hasMany(models.DetalleCompra, { 
        foreignKey: 'CompraID',
        as: 'detalles'
      });
      
      // ❌ ELIMINAR: Esta relación causa el problema
      // Compra.belongsTo(models.Estado, { 
      //   foreignKey: 'EstadoID',
      //   as: 'estado'
      // });
    }
  }
  
  Compra.init({
    CompraID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ProveedorID: {
      type: DataTypes.STRING(255),
      allowNull: false  // ✅ Cambiar a NOT NULL según tu BD
    },
    ProveedorRefId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proveedores',
        key: 'id'
      }
    },
    FechaCompra: {
      type: DataTypes.DATE,
      allowNull: true
    },
    EstadoID: {
      type: DataTypes.STRING(50),  // ✅ STRING simple, no FK
      allowNull: true,
      defaultValue: 'Pendiente'
    }
  }, {
    sequelize,
    modelName: 'Compra',
    tableName: 'compras',
    timestamps: false
  });
  
  return Compra;
};