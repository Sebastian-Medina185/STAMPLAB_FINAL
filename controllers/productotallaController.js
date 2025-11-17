const { ProductoTalla, Producto, Talla } = require('../models');

// Obtener todas las relaciones producto-talla
exports.getAllProductoTallas = async (req, res) => {
    try {
        const productoTallas = await ProductoTalla.findAll({
            include: [
                { model: Producto, as: 'producto' },
                { model: Talla, as: 'talla' }
            ]
        });
        res.json(productoTallas);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener relaciones producto-talla',
            error: error.message
        });
    }
};

// Obtener una relación por ID
exports.getProductoTallaById = async (req, res) => {
    try {
        const productoTalla = await ProductoTalla.findByPk(req.params.id, {
            include: [
                { model: Producto, as: 'producto' },
                { model: Talla, as: 'talla' }
            ]
        });

        if (!productoTalla) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        res.json(productoTalla);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener relación',
            error: error.message
        });
    }
};

// Asignar una talla a un producto
exports.createProductoTalla = async (req, res) => {
    try {
        const { ProductoID, TallaID, StockDisponible, Estado } = req.body;

        const nuevoProductoTalla = await ProductoTalla.create({
            ProductoID,
            TallaID,
            StockDisponible: StockDisponible || 0,
            Estado: Estado !== undefined ? Estado : true
        });

        res.status(201).json({
            message: 'Talla asignada al producto exitosamente',
            productoTalla: nuevoProductoTalla
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al asignar talla',
            error: error.message
        });
    }
};

// Actualizar stock y estado de producto-talla
exports.updateProductoTalla = async (req, res) => {
    try {
        const { StockDisponible, Estado } = req.body;

        const productoTalla = await ProductoTalla.findByPk(req.params.id);

        if (!productoTalla) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        await productoTalla.update({
            StockDisponible: StockDisponible !== undefined ? StockDisponible : productoTalla.StockDisponible,
            Estado: Estado !== undefined ? Estado : productoTalla.Estado
        });

        res.json({
            message: 'Stock actualizado exitosamente',
            productoTalla
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar stock',
            error: error.message
        });
    }
};

// Eliminar una relación producto-talla
exports.deleteProductoTalla = async (req, res) => {
    try {
        const productoTalla = await ProductoTalla.findByPk(req.params.id);

        if (!productoTalla) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        await productoTalla.destroy();

        res.json({ message: 'Talla removida del producto exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar relación',
            error: error.message
        });
    }
};