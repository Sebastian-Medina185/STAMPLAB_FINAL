const { CotizacionTecnica, DetalleCotizacion, Tecnica, Parte } = require('../models');

// Obtener todas las cotizaciones de técnicas
exports.getAllCotizacionTecnicas = async (req, res) => {
    try {
        const cotizacionTecnicas = await CotizacionTecnica.findAll({
            include: [
                { model: DetalleCotizacion, as: 'detalleCotizacion' },
                { model: Tecnica, as: 'tecnica' },
                { model: Parte, as: 'parte' }
            ]
        });
        res.json(cotizacionTecnicas);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener cotizaciones de técnicas',
            error: error.message
        });
    }
};

// Obtener una cotización de técnica por ID
exports.getCotizacionTecnicaById = async (req, res) => {
    try {
        const cotizacionTecnica = await CotizacionTecnica.findByPk(req.params.id, {
            include: [
                { model: DetalleCotizacion, as: 'detalleCotizacion' },
                { model: Tecnica, as: 'tecnica' },
                { model: Parte, as: 'parte' }
            ]
        });

        if (!cotizacionTecnica) {
            return res.status(404).json({ message: 'Cotización de técnica no encontrada' });
        }

        res.json(cotizacionTecnica);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener cotización de técnica',
            error: error.message
        });
    }
};

// Crear una cotización de técnica
exports.createCotizacionTecnica = async (req, res) => {
    try {
        const { DetalleCotizacionID, TecnicaID, ParteID, ImagenDiseño, Observaciones, CostoTecnica } = req.body;

        const nuevaCotizacionTecnica = await CotizacionTecnica.create({
            DetalleCotizacionID,
            TecnicaID,
            ParteID,
            ImagenDiseño,
            Observaciones,
            CostoTecnica: CostoTecnica || 0
        });

        res.status(201).json({
            message: 'Cotización de técnica creada exitosamente',
            cotizacionTecnica: nuevaCotizacionTecnica
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear cotización de técnica',
            error: error.message
        });
    }
};

// Actualizar una cotización de técnica
exports.updateCotizacionTecnica = async (req, res) => {
    try {
        const { ImagenDiseño, Observaciones, CostoTecnica } = req.body;

        const cotizacionTecnica = await CotizacionTecnica.findByPk(req.params.id);

        if (!cotizacionTecnica) {
            return res.status(404).json({ message: 'Cotización de técnica no encontrada' });
        }

        await cotizacionTecnica.update({
            ImagenDiseño: ImagenDiseño || cotizacionTecnica.ImagenDiseño,
            Observaciones: Observaciones || cotizacionTecnica.Observaciones,
            CostoTecnica: CostoTecnica !== undefined ? CostoTecnica : cotizacionTecnica.CostoTecnica
        });

        res.json({
            message: 'Cotización de técnica actualizada exitosamente',
            cotizacionTecnica
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar cotización de técnica',
            error: error.message
        });
    }
};

// Eliminar una cotización de técnica
exports.deleteCotizacionTecnica = async (req, res) => {
    try {
        const cotizacionTecnica = await CotizacionTecnica.findByPk(req.params.id);

        if (!cotizacionTecnica) {
            return res.status(404).json({ message: 'Cotización de técnica no encontrada' });
        }

        await cotizacionTecnica.destroy();

        res.json({ message: 'Cotización de técnica eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar cotización de técnica',
            error: error.message
        });
    }
};