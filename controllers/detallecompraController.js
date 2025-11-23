const { DetalleCompra, Compra, Insumo } = require('../models');

// Obtener todos los detalles de compra
exports.getAllDetalleCompras = async (req, res) => {
    try {
        const detalleCompras = await DetalleCompra.findAll({
            include: [
                { model: Compra, as: 'compra' },
                { model: Insumo, as: 'insumo' }
            ]
        });
        res.json(detalleCompras);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener detalles de compra',
            error: error.message
        });
    }
};

// Obtener un detalle de compra por ID
exports.getDetalleCompraById = async (req, res) => {
    try {
        const detalleCompra = await DetalleCompra.findByPk(req.params.id, {
            include: [
                { model: Compra, as: 'compra' },
                { model: Insumo, as: 'insumo' }
            ]
        });

        if (!detalleCompra) {
            return res.status(404).json({ message: 'Detalle de compra no encontrado' });
        }

        res.json(detalleCompra);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener detalle de compra',
            error: error.message
        });
    }
};

// Crear un detalle de compra
exports.createDetalleCompra = async (req, res) => {
    try {
        const { CompraID, InsumoID, Cantidad, PrecioUnitario } = req.body;

        const nuevoDetalle = await DetalleCompra.create({
            CompraID,
            InsumoID,
            Cantidad,
            PrecioUnitario  // Agregar
        });

        res.status(201).json({
            message: 'Detalle de compra creado exitosamente',
            detalleCompra: nuevoDetalle
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear detalle de compra',
            error: error.message
        });
    }
};

// Actualizar un detalle de compra
exports.updateDetalleCompra = async (req, res) => {
    try {
        const { Cantidad } = req.body;

        const detalleCompra = await DetalleCompra.findByPk(req.params.id);

        if (!detalleCompra) {
            return res.status(404).json({ message: 'Detalle de compra no encontrado' });
        }

        await detalleCompra.update({
            Cantidad: Cantidad || detalleCompra.Cantidad
        });

        res.json({
            message: 'Detalle de compra actualizado exitosamente',
            detalleCompra
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar detalle de compra',
            error: error.message
        });
    }
};

// Eliminar un detalle de compra
exports.deleteDetalleCompra = async (req, res) => {
    try {
        const detalleCompra = await DetalleCompra.findByPk(req.params.id);

        if (!detalleCompra) {
            return res.status(404).json({ message: 'Detalle de compra no encontrado' });
        }

        await detalleCompra.destroy();

        res.json({ message: 'Detalle de compra eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar detalle de compra',
            error: error.message
        });
    }
};