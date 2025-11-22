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
      
<<<<<<< HEAD
      // ✅ Relación con Estado (si existe la tabla estados)
      Compra.belongsTo(models.Estado, {
=======
      // Una compra pertenece a un estado
      Compra.belongsTo(models.Estado, { 
>>>>>>> 9c93189 (Ultima version)
        foreignKey: 'EstadoID',
        as: 'estado'
      });
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
      allowNull: true
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
      type: DataTypes.INTEGER,
<<<<<<< HEAD
      allowNull: true
=======
      references: {
        model: 'Estados',
        key: 'EstadoID'
      }
>>>>>>> 9c93189 (Ultima version)
    }
  }, {
    sequelize,
    modelName: 'Compra',
    tableName: 'compras',
    timestamps: false
  });
  
  return Compra;
};