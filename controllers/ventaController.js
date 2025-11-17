const { Venta, Usuario, DetalleVenta, Producto, Tecnica } = require('../models');

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