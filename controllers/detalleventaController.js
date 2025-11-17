const { DetalleVenta, Venta, Producto, Tecnica } = require('../models');

// Obtener todos los detalles de venta
exports.getAllDetalleVentas = async (req, res) => {
    try {
        const detalleVentas = await DetalleVenta.findAll({
            include: [
                { model: Venta, as: 'venta' },
                { model: Producto, as: 'producto' },
                { model: Tecnica, as: 'tecnica' }
            ]
        });
        res.json(detalleVentas);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener detalles de venta',
            error: error.message
        });
    }
};

// Obtener un detalle de venta por ID
exports.getDetalleVentaById = async (req, res) => {
    try {
        const detalleVenta = await DetalleVenta.findByPk(req.params.id, {
            include: [
                { model: Venta, as: 'venta' },
                { model: Producto, as: 'producto' },
                { model: Tecnica, as: 'tecnica' }
            ]
        });

        if (!detalleVenta) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }

        res.json(detalleVenta);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener detalle de venta',
            error: error.message
        });
    }
};

// Crear un detalle de venta
exports.createDetalleVenta = async (req, res) => {
    try {
        const { VentaID, ProductoID, TecnicaID } = req.body;

        const nuevoDetalle = await DetalleVenta.create({
            VentaID,
            ProductoID,
            TecnicaID
        });

        res.status(201).json({
            message: 'Detalle de venta creado exitosamente',
            detalleVenta: nuevoDetalle
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear detalle de venta',
            error: error.message
        });
    }
};

// Actualizar un detalle de venta
exports.updateDetalleVenta = async (req, res) => {
    try {
        const { ProductoID, TecnicaID } = req.body;

        const detalleVenta = await DetalleVenta.findByPk(req.params.id);

        if (!detalleVenta) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }

        await detalleVenta.update({
            ProductoID: ProductoID || detalleVenta.ProductoID,
            TecnicaID: TecnicaID || detalleVenta.TecnicaID
        });

        res.json({
            message: 'Detalle de venta actualizado exitosamente',
            detalleVenta
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar detalle de venta',
            error: error.message
        });
    }
};

// Eliminar un detalle de venta
exports.deleteDetalleVenta = async (req, res) => {
    try {
        const detalleVenta = await DetalleVenta.findByPk(req.params.id);

        if (!detalleVenta) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }

        await detalleVenta.destroy();

        res.json({ message: 'Detalle de venta eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar detalle de venta',
            error: error.message
        });
    }
};