const { Talla, Producto } = require('../models');

// Obtener todas las tallas
exports.getAllTallas = async (req, res) => {
    try {
        const tallas = await Talla.findAll();
        res.json(tallas);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener tallas',
            error: error.message
        });
    }
};

// Obtener una talla por ID
exports.getTallaById = async (req, res) => {
    try {
        const talla = await Talla.findByPk(req.params.id, {
            include: [
                {
                    model: Producto,
                    as: 'productos',
                    through: { attributes: [] }
                }
            ]
        });

        if (!talla) {
            return res.status(404).json({ message: 'Talla no encontrada' });
        }

        res.json(talla);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener talla',
            error: error.message
        });
    }
};

// Crear una nueva talla
exports.createTalla = async (req, res) => {
    try {
        const { Nombre, Precio } = req.body;

        const nuevaTalla = await Talla.create({
            Nombre,
            Precio
        });

        res.status(201).json({
            message: 'Talla creada exitosamente',
            talla: nuevaTalla
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear talla',
            error: error.message
        });
    }
};

// Actualizar una talla
exports.updateTalla = async (req, res) => {
    try {
        const { Nombre, Precio } = req.body;

        const talla = await Talla.findByPk(req.params.id);

        if (!talla) {
            return res.status(404).json({ message: 'Talla no encontrada' });
        }

        await talla.update({
            Nombre: Nombre || talla.Nombre,
            Precio: Precio !== undefined ? Precio : talla.Precio
        });

        res.json({
            message: 'Talla actualizada exitosamente',
            talla
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar talla',
            error: error.message
        });
    }
};

// Eliminar una talla
exports.deleteTalla = async (req, res) => {
    try {
        const talla = await Talla.findByPk(req.params.id);

        if (!talla) {
            return res.status(404).json({ message: 'Talla no encontrada' });
        }

        await talla.destroy();

        res.json({ message: 'Talla eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar talla',
            error: error.message
        });
    }
};