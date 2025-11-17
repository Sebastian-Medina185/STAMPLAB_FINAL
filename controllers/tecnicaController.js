const { Tecnica } = require('../models');

// Obtener todas las técnicas
exports.getAllTecnicas = async (req, res) => {
    try {
        const tecnicas = await Tecnica.findAll();
        res.json(tecnicas);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener técnicas',
            error: error.message
        });
    }
};

// Obtener una técnica por ID
exports.getTecnicaById = async (req, res) => {
    try {
        const tecnica = await Tecnica.findByPk(req.params.id);

        if (!tecnica) {
            return res.status(404).json({ message: 'Técnica no encontrada' });
        }

        res.json(tecnica);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener técnica',
            error: error.message
        });
    }
};

// Crear una nueva técnica
exports.createTecnica = async (req, res) => {
    try {
        const { Nombre, imagenTecnica, Descripcion, Estado } = req.body;

        const nuevaTecnica = await Tecnica.create({
            Nombre,
            imagenTecnica,
            Descripcion,
            Estado: Estado !== undefined ? Estado : true
        });

        res.status(201).json({
            message: 'Técnica creada exitosamente',
            tecnica: nuevaTecnica
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear técnica',
            error: error.message
        });
    }
};

// Actualizar una técnica
exports.updateTecnica = async (req, res) => {
    try {
        const { Nombre, imagenTecnica, Descripcion, Estado } = req.body;

        const tecnica = await Tecnica.findByPk(req.params.id);

        if (!tecnica) {
            return res.status(404).json({ message: 'Técnica no encontrada' });
        }

        await tecnica.update({
            Nombre: Nombre || tecnica.Nombre,
            imagenTecnica: imagenTecnica || tecnica.imagenTecnica,
            Descripcion: Descripcion || tecnica.Descripcion,
            Estado: Estado !== undefined ? Estado : tecnica.Estado
        });

        res.json({
            message: 'Técnica actualizada exitosamente',
            tecnica
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar técnica',
            error: error.message
        });
    }
};

// Eliminar una técnica
exports.deleteTecnica = async (req, res) => {
    try {
        const tecnica = await Tecnica.findByPk(req.params.id);

        if (!tecnica) {
            return res.status(404).json({ message: 'Técnica no encontrada' });
        }

        await tecnica.destroy();

        res.json({ message: 'Técnica eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar técnica',
            error: error.message
        });
    }
};