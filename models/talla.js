'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Talla extends Model {
        static associate(models) {
            
            // Relación inventarioproducto:
            Talla.hasMany(models.InventarioProducto, {
                foreignKey: 'TallaID',
                as: 'inventario'
            });

            // Mantener:
            Talla.hasMany(models.CotizacionTalla, {
                foreignKey: 'TallaID',
                as: 'cotizacionesTalla'
            });

            // Nueva para DetalleVenta
            Talla.hasMany(models.DetalleVenta, {
                foreignKey: 'TallaID',
                as: 'detallesVenta'
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
        tableName: 'tallas',
        timestamps: false
    });

    return Talla;
};