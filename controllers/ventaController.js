const { Venta, Usuario, DetalleVenta, Producto, Color, Talla, InventarioProducto, Estado } = require('../models');

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