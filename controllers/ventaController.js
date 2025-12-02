const { Venta, Usuario, DetalleVenta, Producto, Tecnica, Insumo, InventarioProducto, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las ventas
exports.getAllVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: { exclude: ['Contraseña'] }
                },
                {
                    model: DetalleVenta,
                    as: 'detalles',
                    include: [
                        { model: Producto, as: 'producto' },
                        { model: Color, as: 'color' },
                        { model: Talla, as: 'talla' }
                    ]
                },
                {
                    model: Estado,
                    as: 'estado'
                }
            ],
            order: [['VentaID', 'DESC']]
        });
        res.json(ventas);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener ventas',
            error: error.message
        });
    }
};

// Obtener una venta por ID
exports.getVentaById = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id, {
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: { exclude: ['Contraseña'] }
                },
                {
                    model: DetalleVenta,
                    as: 'detalles',
                    include: [
                        { model: Producto, as: 'producto' },
                        { model: Color, as: 'color' },
                        { model: Talla, as: 'talla' }
                    ]
                },
                {
                    model: Estado,
                    as: 'estado'
                }
            ]
        });

        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        res.json(venta);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener venta',
            error: error.message
        });
    }
};

// CREAR VENTA CON DESCUENTO DE STOCK
exports.crearVenta = async (req, res) => {
    try {
        const { DocumentoID, Subtotal, Total, EstadoID, detalles } = req.body;

        if (!DocumentoID || !detalles || detalles.length === 0) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // VALIDAR STOCK ANTES DE CREAR LA VENTA
        for (const item of detalles) {
            const variante = await InventarioProducto.findOne({
                where: {
                    ProductoID: item.ProductoID,
                    ColorID: item.ColorID,
                    TallaID: item.TallaID
                }
            });

            if (!variante) {
                return res.status(400).json({
                    error: `No existe variante para Producto ${item.ProductoID}, Color ${item.ColorID}, Talla ${item.TallaID}`
                });
            }

            if (variante.Stock < item.Cantidad) {
                return res.status(400).json({
                    error: `Stock insuficiente. Disponible: ${variante.Stock}, Solicitado: ${item.Cantidad}`
                });
            }
        }

        // Crear la venta
        const nuevaVenta = await Venta.create({
            DocumentoID,
            Subtotal,
            Total,
            EstadoID: EstadoID || 8 // 8 = Pendiente por defecto
        });

        // Crear detalles y descontar stock
        for (const item of detalles) {
            await DetalleVenta.create({
                VentaID: nuevaVenta.VentaID,
                ProductoID: item.ProductoID,
                Cantidad: item.Cantidad,
                PrecioUnitario: item.PrecioUnitario,
                ColorID: item.ColorID,
                TallaID: item.TallaID
            });

            // DESCONTAR STOCK
            await InventarioProducto.decrement(
                'Stock',
                {
                    by: item.Cantidad,
                    where: {
                        ProductoID: item.ProductoID,
                        ColorID: item.ColorID,
                        TallaID: item.TallaID
                    }
                }
            );
        }

        return res.status(201).json({
            message: "Venta creada correctamente",
            venta: nuevaVenta
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error al crear venta",
            error: error.message
        });
    }
};

// ACTUALIZAR VENTA COMPLETA (con detalles)
exports.updateVenta = async (req, res) => {
    try {
        const { EstadoID, Subtotal, Total, detalles } = req.body;
        const ventaId = req.params.id;

        const venta = await Venta.findByPk(ventaId);

        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        // Si solo se actualiza el estado (cambio de estado desde el modal)
        if (EstadoID && !detalles) {
            await venta.update({ EstadoID });
            return res.json({
                message: 'Estado actualizado exitosamente',
                venta
            });
        }

        // Si se actualizan los detalles (edición completa)
        if (detalles && detalles.length > 0) {
            // Eliminar detalles antiguos
            await DetalleVenta.destroy({
                where: { VentaID: ventaId }
            });

            // Crear nuevos detalles
            for (const item of detalles) {
                await DetalleVenta.create({
                    VentaID: ventaId,
                    ProductoID: item.ProductoID,
                    Cantidad: item.Cantidad,
                    PrecioUnitario: item.PrecioUnitario,
                    ColorID: item.ColorID,
                    TallaID: item.TallaID
                });
            }

            // Actualizar totales
            await venta.update({
                Subtotal: Subtotal || venta.Subtotal,
                Total: Total || venta.Total,
                EstadoID: EstadoID || venta.EstadoID
            });
        }

        res.json({
            message: 'Venta actualizada exitosamente',
            venta
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al actualizar venta',
            error: error.message
        });
    }
};

// Eliminar una venta
exports.deleteVenta = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id);

        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        // Eliminar primero los detalles
        await DetalleVenta.destroy({
            where: { VentaID: req.params.id }
        });

        // Luego eliminar la venta
        await venta.destroy();

        res.json({ message: 'Venta eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar venta',
            error: error.message
        });
    }
};

// Obtener datos para el dashboard de medición de desempeño
exports.getDashboardData = async (req, res) => {
    try {
        const { mes, tecnicaId, productoId } = req.query;

        // Construir filtros dinámicos
        let whereVenta = {};
        let whereDetalle = {};

        // Filtro por mes
        if (mes) {
            const mesNum = parseInt(mes);
            whereVenta.FechaVenta = {
                [Op.and]: [
                    sequelize.where(sequelize.fn('MONTH', sequelize.col('FechaVenta')), mesNum),
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('FechaVenta')), new Date().getFullYear())
                ]
            };
        }

        // Filtro por técnica
        if (tecnicaId) {
            whereDetalle.TecnicaID = parseInt(tecnicaId);
        }

        // Filtro por producto
        if (productoId) {
            whereDetalle.ProductoID = parseInt(productoId);
        }

        // 1. VENTAS POR TÉCNICAS (agrupado por mes)
        const ventasPorTecnicas = await DetalleVenta.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('venta.FechaVenta')), 'mes'],
                [sequelize.fn('COUNT', sequelize.col('DetalleVentaID')), 'ventas']
            ],
            include: [
                {
                    model: Venta,
                    as: 'venta',
                    attributes: [],
                    where: whereVenta
                },
                {
                    model: Tecnica,
                    as: 'tecnica',
                    attributes: []
                }
            ],
            where: whereDetalle,
            group: [sequelize.fn('MONTH', sequelize.col('venta.FechaVenta'))],
            order: [[sequelize.fn('MONTH', sequelize.col('venta.FechaVenta')), 'ASC']],
            raw: true
        });

        // 2. PRODUCTOS MÁS VENDIDOS (agrupado por mes)
        const productosMasVendidos = await DetalleVenta.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('venta.FechaVenta')), 'mes'],
                [sequelize.fn('SUM', sequelize.col('Cantidad')), 'cantidad']
            ],
            include: [
                {
                    model: Venta,
                    as: 'venta',
                    attributes: [],
                    where: whereVenta
                },
                {
                    model: Producto,
                    as: 'producto',
                    attributes: []
                }
            ],
            where: whereDetalle,
            group: [sequelize.fn('MONTH', sequelize.col('venta.FechaVenta'))],
            order: [[sequelize.fn('MONTH', sequelize.col('venta.FechaVenta')), 'ASC']],
            raw: true
        });

        // 3. INSUMOS MÁS UTILIZADOS (basado en las telas de los productos vendidos)
        const insumosUtilizados = await DetalleVenta.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('venta.FechaVenta')), 'mes'],
                [sequelize.fn('COUNT', sequelize.col('DetalleVentaID')), 'cantidad']
            ],
            include: [
                {
                    model: Venta,
                    as: 'venta',
                    attributes: [],
                    where: whereVenta
                },
                {
                    model: Producto,
                    as: 'producto',
                    attributes: [],
                    include: [
                        {
                            model: InventarioProducto,
                            as: 'inventario',
                            attributes: [],
                            include: [
                                {
                                    model: Insumo,
                                    as: 'tela',
                                    attributes: [],
                                    where: { Tipo: 'Tela' },
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ],
            where: whereDetalle,
            group: [sequelize.fn('MONTH', sequelize.col('venta.FechaVenta'))],
            order: [[sequelize.fn('MONTH', sequelize.col('venta.FechaVenta')), 'ASC']],
            raw: true
        });

        // Formatear datos para el frontend (nombres de meses)
        const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const formatearDatos = (datos) => {
            return datos.map(item => ({
                mes: mesesNombres[item.mes - 1],
                ventas: parseInt(item.ventas) || 0,
                cantidad: parseInt(item.cantidad) || 0
            }));
        };

        res.json({
            estado: true,
            mensaje: 'Datos del dashboard obtenidos exitosamente',
            datos: {
                ventasPorTecnicas: formatearDatos(ventasPorTecnicas),
                productosMasVendidos: formatearDatos(productosMasVendidos),
                insumosUtilizados: formatearDatos(insumosUtilizados)
            }
        });

    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener datos del dashboard',
            error: error.message
        });
    }
};