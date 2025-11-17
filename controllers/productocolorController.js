const { ProductoColor, Producto, Color } = require('../models');

// Obtener todas las relaciones producto-color
exports.getAllProductoColores = async (req, res) => {
    try {
        const productoColores = await ProductoColor.findAll({
            include: [
                { model: Producto, as: 'producto' },
                { model: Color, as: 'color' }
            ]
        });
        res.json(productoColores);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener relaciones producto-color',
            error: error.message
        });
    }
};

// Obtener una relación por ID
exports.getProductoColorById = async (req, res) => {
    try {
        const productoColor = await ProductoColor.findByPk(req.params.id, {
            include: [
                { model: Producto, as: 'producto' },
                { model: Color, as: 'color' }
            ]
        });

        if (!productoColor) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        res.json(productoColor);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener relación',
            error: error.message
        });
    }
};

// Asignar un color a un producto
exports.createProductoColor = async (req, res) => {
    try {
        const { ProductoID, ColorID, Estado } = req.body;

        const nuevoProductoColor = await ProductoColor.create({
            ProductoID,
            ColorID,
            Estado: Estado !== undefined ? Estado : true
        });

        res.status(201).json({
            message: 'Color asignado al producto exitosamente',
            productoColor: nuevoProductoColor
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al asignar color',
            error: error.message
        });
    }
};

// Actualizar estado de producto-color
exports.updateProductoColor = async (req, res) => {
    try {
        const { Estado } = req.body;

        const productoColor = await ProductoColor.findByPk(req.params.id);

        if (!productoColor) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        await productoColor.update({
            Estado: Estado !== undefined ? Estado : productoColor.Estado
        });

        res.json({
            message: 'Estado actualizado exitosamente',
            productoColor
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar estado',
            error: error.message
        });
    }
};

// Eliminar una relación producto-color
exports.deleteProductoColor = async (req, res) => {
    try {
        const productoColor = await ProductoColor.findByPk(req.params.id);

        if (!productoColor) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        await productoColor.destroy();

        res.json({ message: 'Color removido del producto exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar relación',
            error: error.message
        });
    }
};