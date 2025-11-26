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
                        { model: Tecnica, as: 'tecnica' }
                    ]
                }
            ]
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
                        { model: Tecnica, as: 'tecnica' }
                    ]
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

// Crear una nueva venta con detalles
exports.createVenta = async (req, res) => {
    try {
        const { DocumentoID, Estado, Subtotal, Total, detalles } = req.body;

        // Crear la venta
        const nuevaVenta = await Venta.create({
            DocumentoID,
            FechaVenta: new Date(),
            Estado: Estado !== undefined ? Estado : true,
            Subtotal: Subtotal || 0,
            Total: Total || 0
        });

        // Crear los detalles de la venta
        if (detalles && detalles.length > 0) {
            const detallesConVentaID = detalles.map(detalle => ({
                VentaID: nuevaVenta.VentaID,
                ProductoID: detalle.ProductoID,
                TecnicaID: detalle.TecnicaID
            }));

            await DetalleVenta.bulkCreate(detallesConVentaID);
        }

        // Retornar la venta completa
        const ventaCompleta = await Venta.findByPk(nuevaVenta.VentaID, {
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
                        { model: Tecnica, as: 'tecnica' }
                    ]
                }
            ]
        });

        res.status(201).json({
            message: 'Venta creada exitosamente',
            venta: ventaCompleta
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear venta',
            error: error.message
        });
    }
};

// Actualizar una venta
exports.updateVenta = async (req, res) => {
    try {
        const { Estado, Subtotal, Total } = req.body;

        const venta = await Venta.findByPk(req.params.id);

        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        await venta.update({
            Estado: Estado !== undefined ? Estado : venta.Estado,
            Subtotal: Subtotal !== undefined ? Subtotal : venta.Subtotal,
            Total: Total !== undefined ? Total : venta.Total
        });

        res.json({
            message: 'Venta actualizada exitosamente',
            venta
        });
    } catch (error) {
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