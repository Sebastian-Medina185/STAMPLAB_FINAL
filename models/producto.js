'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Producto extends Model {
        static associate(models) {

            // Relación directa con InventarioProducto
            Producto.hasMany(models.InventarioProducto, {
                foreignKey: 'ProductoID',
                as: 'inventario'
            });

            // Relación muchos a muchos con Insumos (mantener)
            Producto.belongsToMany(models.Insumo, {
                through: models.ProductoInsumo,
                foreignKey: 'ProductoID',
                otherKey: 'InsumoID',
                as: 'insumos'
            });

            // Relación con DetalleVenta (mantener)
            Producto.hasMany(models.DetalleVenta, {
                foreignKey: 'ProductoID',
                as: 'detallesVenta'
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
        tableName: 'productos',
        timestamps: false
    });

    return Producto;
};