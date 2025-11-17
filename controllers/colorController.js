const { Color, Producto } = require('../models');

// Obtener todos los colores
exports.getAllColores = async (req, res) => {
    try {
        const colores = await Color.findAll();
        res.json(colores);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener colores',
            error: error.message
        });
    }
};

// Obtener un color por ID
exports.getColorById = async (req, res) => {
    try {
        const color = await Color.findByPk(req.params.id, {
            include: [
                {
                    model: Producto,
                    as: 'productos',
                    through: { attributes: [] }
                }
            ]
        });

        if (!color) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }

        res.json(color);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener color',
            error: error.message
        });
    }
};

// Crear un nuevo color
exports.createColor = async (req, res) => {
    try {
        const { Nombre, Cantidad } = req.body;

        const nuevoColor = await Color.create({
            Nombre,
            Cantidad: Cantidad || 0
        });

        res.status(201).json({
            message: 'Color creado exitosamente',
            color: nuevoColor
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear color',
            error: error.message
        });
    }
};

// Actualizar un color
exports.updateColor = async (req, res) => {
    try {
        const { Nombre, Cantidad } = req.body;

        const color = await Color.findByPk(req.params.id);

        if (!color) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }

        await color.update({
            Nombre: Nombre || color.Nombre,
            Cantidad: Cantidad !== undefined ? Cantidad : color.Cantidad
        });

        res.json({
            message: 'Color actualizado exitosamente',
            color
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar color',
            error: error.message
        });
    }
};

// Eliminar un color
exports.deleteColor = async (req, res) => {
    try {
        const color = await Color.findByPk(req.params.id);

        if (!color) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }

        await color.destroy();

        res.json({ message: 'Color eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar color',
            error: error.message
        });
    }
};