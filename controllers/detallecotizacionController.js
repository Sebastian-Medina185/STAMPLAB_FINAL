const {
    DetalleCotizacion,
    Cotizacion,
    Usuario,
    CotizacionTecnica,
    CotizacionTalla,
    CotizacionColor,
    CotizacionInsumo,
    CotizacionProducto
} = require('../models');

// Obtener todos los detalles de cotización
exports.getAllDetalleCotizaciones = async (req, res) => {
    try {
        const detalleCotizaciones = await DetalleCotizacion.findAll({
            include: [
                { model: Cotizacion, as: 'cotizacion' },
                { model: Usuario, as: 'usuario', attributes: { exclude: ['Contraseña'] } },
                { model: CotizacionTecnica, as: 'tecnicas' },
                { model: CotizacionTalla, as: 'tallas' },
                { model: CotizacionColor, as: 'colores' },
                { model: CotizacionInsumo, as: 'insumos' },
                { model: CotizacionProducto, as: 'productos' }
            ]
        });
        res.json(detalleCotizaciones);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener detalles de cotización',
            error: error.message
        });
    }
};

// Obtener un detalle de cotización por ID
exports.getDetalleCotizacionById = async (req, res) => {
    try {
        const detalleCotizacion = await DetalleCotizacion.findByPk(req.params.id, {
            include: [
                { model: Cotizacion, as: 'cotizacion' },
                { model: Usuario, as: 'usuario', attributes: { exclude: ['Contraseña'] } },
                { model: CotizacionTecnica, as: 'tecnicas' },
                { model: CotizacionTalla, as: 'tallas' },
                { model: CotizacionColor, as: 'colores' },
                { model: CotizacionInsumo, as: 'insumos' },
                { model: CotizacionProducto, as: 'productos' }
            ]
        });

        if (!detalleCotizacion) {
            return res.status(404).json({ message: 'Detalle de cotización no encontrado' });
        }

        res.json(detalleCotizacion);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener detalle de cotización',
            error: error.message
        });
    }
};

// Crear un detalle de cotización
exports.createDetalleCotizacion = async (req, res) => {
    try {
        const { DocumentoID, CotizacionID, Cantidad, TraePrenda, PrendaDescripcion } = req.body;

        const nuevoDetalle = await DetalleCotizacion.create({
            DocumentoID,
            CotizacionID,
            Cantidad,
            TraePrenda: TraePrenda || false,
            PrendaDescripcion
        });

        res.status(201).json({
            message: 'Detalle de cotización creado exitosamente',
            detalleCotizacion: nuevoDetalle
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear detalle de cotización',
            error: error.message
        });
    }
};

// Actualizar un detalle de cotización
exports.updateDetalleCotizacion = async (req, res) => {
    try {
        const { Cantidad, TraePrenda, PrendaDescripcion } = req.body;

        const detalleCotizacion = await DetalleCotizacion.findByPk(req.params.id);

        if (!detalleCotizacion) {
            return res.status(404).json({ message: 'Detalle de cotización no encontrado' });
        }

        await detalleCotizacion.update({
            Cantidad: Cantidad || detalleCotizacion.Cantidad,
            TraePrenda: TraePrenda !== undefined ? TraePrenda : detalleCotizacion.TraePrenda,
            PrendaDescripcion: PrendaDescripcion || detalleCotizacion.PrendaDescripcion
        });

        res.json({
            message: 'Detalle de cotización actualizado exitosamente',
            detalleCotizacion
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar detalle de cotización',
            error: error.message
        });
    }
};

// Eliminar un detalle de cotización
exports.deleteDetalleCotizacion = async (req, res) => {
    try {
        const detalleCotizacion = await DetalleCotizacion.findByPk(req.params.id);

        if (!detalleCotizacion) {
            return res.status(404).json({ message: 'Detalle de cotización no encontrado' });
        }

        await detalleCotizacion.destroy();

        res.json({ message: 'Detalle de cotización eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar detalle de cotización',
            error: error.message
        });
    }
};