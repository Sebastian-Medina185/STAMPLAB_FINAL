const { Estado, Venta } = require('../models');

// Obtener todos los estados
exports.getAllEstados = async (req, res) => {
    try {
        const estados = await Estado.findAll({
            include: [
                {
                    model: Venta,
                    as: 'venta'
                }
            ]
        });
        res.json(estados);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener estados',
            error: error.message
        });
    }
};

// Obtener un estado por ID
exports.getEstadoById = async (req, res) => {
    try {
        const estado = await Estado.findByPk(req.params.id, {
            include: [
                {
                    model: Venta,
                    as: 'venta'
                }
            ]
        });

        if (!estado) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }

        await estado.update({
            Nombre: Nombre || estado.Nombre,
            VentaID: VentaID || estado.VentaID
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