const { ProductoInsumo, Producto, Insumo } = require('../models');

// Obtener todas las relaciones producto-insumo
exports.getAllProductoInsumos = async (req, res) => {
    try {
        const productoInsumos = await ProductoInsumo.findAll({
            include: [
                { model: Producto, as: 'producto' },
                { model: Insumo, as: 'insumo' }
            ]
        });
        res.json(productoInsumos);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener relaciones producto-insumo',
            error: error.message
        });
    }
};

// Obtener una relación por ID
exports.getProductoInsumoById = async (req, res) => {
    try {
        const productoInsumo = await ProductoInsumo.findByPk(req.params.id, {
            include: [
                { model: Producto, as: 'producto' },
                { model: Insumo, as: 'insumo' }
            ]
        });

        if (!productoInsumo) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        res.json(productoInsumo);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener relación',
            error: error.message
        });
    }
};

// Asignar un insumo a un producto
exports.createProductoInsumo = async (req, res) => {
    try {
        const { ProductoID, InsumoID } = req.body;

        const nuevoProductoInsumo = await ProductoInsumo.create({
            ProductoID,
            InsumoID
        });

        res.status(201).json({
            message: 'Insumo asignado al producto exitosamente',
            productoInsumo: nuevoProductoInsumo
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al asignar insumo',
            error: error.message
        });
    }
};

// Eliminar una relación producto-insumo
exports.deleteProductoInsumo = async (req, res) => {
    try {
        const productoInsumo = await ProductoInsumo.findByPk(req.params.id);

        if (!productoInsumo) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        await productoInsumo.destroy();

        res.json({ message: 'Insumo removido del producto exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar relación',
            error: error.message
        });
    }
};