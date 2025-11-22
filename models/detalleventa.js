'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DetalleVenta extends Model {
        static associate(models) {
            DetalleVenta.belongsTo(models.Producto, {
                foreignKey: 'ProductoID',
                as: 'producto'
            });

            // Nueva relacion:
            DetalleVenta.belongsTo(models.Color, {
                foreignKey: 'ColorID',
                as: 'color'
            });

            DetalleVenta.belongsTo(models.Talla, {
                foreignKey: 'TallaID',
                as: 'talla'
            });

            DetalleVenta.belongsTo(models.Tecnica, {
                foreignKey: 'TecnicaID',
                as: 'tecnica'
            });

            DetalleVenta.belongsTo(models.Venta, {
                foreignKey: 'VentaID',
                as: 'venta'
            });
        }
    }

    DetalleVenta.init({
        DetalleVentaID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        VentaID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Ventas',
                key: 'VentaID'
            }
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
            references: {
                model: 'Colores',
                key: 'ColorID'
            }
        },
        TallaID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Tallas',
                key: 'TallaID'
            }
        },
        TecnicaID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Tecnicas',
                key: 'TecnicaID'
            }
        },
        Cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        PrecioUnitario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'DetalleVenta',
        tableName: 'detalleventa',
        timestamps: false
    });

    return DetalleVenta;
};