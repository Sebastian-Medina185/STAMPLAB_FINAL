'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class InventarioProducto extends Model {
        static associate(models) {
            // Relación con Producto
            InventarioProducto.belongsTo(models.Producto, {
                foreignKey: 'ProductoID',
                as: 'producto'
            });

            // Relación con Color
            InventarioProducto.belongsTo(models.Color, {
                foreignKey: 'ColorID',
                as: 'color'
            });

            // Relación con Talla
            InventarioProducto.belongsTo(models.Talla, {
                foreignKey: 'TallaID',
                as: 'talla'
            });
        }
    }

    InventarioProducto.init({
        InventarioID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        ProductoID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Productos',
                key: 'ProductoID'
            }
        },
        ColorID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Colores',
                key: 'ColorID'
            }
        },
        TallaID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Tallas',
                key: 'TallaID'
            }
        },
        Stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        Estado: {
            type: DataTypes.TINYINT(1), // Para MySQL es tinyint(1) que se mapea como boolean
            allowNull: true,
            defaultValue: 1
        }
    }, {
        sequelize,
        modelName: 'InventarioProducto',
        tableName: 'inventarioproducto', // Nombre en minúsculas según tu BD
        timestamps: true, // Activa createdAt y updatedAt
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    return InventarioProducto;
};

