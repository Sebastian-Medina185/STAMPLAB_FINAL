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

      // ✅ OPCIONAL: Si tienes tabla Estados
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
      allowNull: false,
      comment: 'Nit del proveedor (campo legacy)'
    },
    ProveedorRefId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proveedores',
        key: 'id'
      },
      comment: 'FK al id del proveedor (campo nuevo)'
    },
    FechaCompra: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    EstadoID: {
      type: DataTypes.INTEGER,  
      allowNull: true,
      defaultValue: 4,  // "Solicitada" por defecto
      comment: 'FK a la tabla estados'
    }
  }, {
    sequelize,
    modelName: 'Compra',
    tableName: 'compras',
    timestamps: false
  });

  return Compra;
};