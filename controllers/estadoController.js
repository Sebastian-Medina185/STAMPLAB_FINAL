const { Estado, Venta, Cotizacion, Compra } = require('../models');

// Obtener todos los estados
exports.getAllEstados = async (req, res) => {
    try {
        const estados = await Estado.findAll();
        res.json(estados);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener estados',
            error: error.message
        });
    }
};

// Obtener estados por tipo
exports.getEstadosByTipo = async (req, res) => {
    try {
        const { tipo } = req.params; // cotizacion, venta, compra
        const estados = await Estado.findAll({
            where: { Tipo: tipo }
        });
        res.json(estados);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener estados por tipo',
            error: error.message
        });
    }
};

// Obtener un estado por ID
exports.getEstadoById = async (req, res) => {
    try {
        const estado = await Estado.findByPk(req.params.id);

        if (!estado) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }

        res.json(estado);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener estado',
            error: error.message
        });
    }
};

// Crear un nuevo estado
exports.createEstado = async (req, res) => {
    try {
        const { Nombre, Tipo, Descripcion } = req.body;

        const nuevoEstado = await Estado.create({
            Nombre,
            Tipo,
            Descripcion
        });

        res.status(201).json({
            message: 'Estado creado exitosamente',
            estado: nuevoEstado
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear estado',
            error: error.message
        });
    }
};

// Actualizar un estado
exports.updateEstado = async (req, res) => {
    try {
        const { Nombre, Descripcion } = req.body;

        const estado = await Estado.findByPk(req.params.id);

        if (!estado) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }

        await estado.update({
            Nombre: Nombre || estado.Nombre,
            Descripcion: Descripcion || estado.Descripcion
        });

        res.json({
            message: 'Estado actualizado exitosamente',
            estado
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar estado',
            error: error.message
        });
    }
};

// Eliminar un estado
exports.deleteEstado = async (req, res) => {
    try {
        const estado = await Estado.findByPk(req.params.id);

        if (!estado) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }

        await estado.destroy();

        res.json({ message: 'Estado eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar estado',
            error: error.message
        });
    }
};