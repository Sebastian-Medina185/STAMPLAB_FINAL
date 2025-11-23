const {
    Cotizacion,
    DetalleCotizacion,
    Estado,
    Usuario,
    CotizacionTecnica,
    CotizacionTalla,
    CotizacionColor,
    CotizacionInsumo,
    Tecnica,
    Talla,
    Color,
    Insumo,
    Producto,
    Parte
} = require('../models');

// Obtener todas las cotizaciones
exports.getAllCotizaciones = async (req, res) => {
    try {
        const cotizaciones = await Cotizacion.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'usuario'
                },
                {
                    model: Estado,
                    as: 'estado'
                },
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        {
                            model: Producto,
                            as: 'producto'
                        },
                        {
                            model: CotizacionTecnica,
                            as: 'tecnicas',
                            include: [
                                { model: Tecnica, as: 'tecnica' },
                                { model: Parte, as: 'parte' }
                            ]
                        },
                        {
                            model: CotizacionTalla,
                            as: 'tallas',
                            include: [{ model: Talla, as: 'talla' }]
                        },
                        {
                            model: CotizacionColor,
                            as: 'colores',
                            include: [{ model: Color, as: 'color' }]
                        },
                        {
                            model: CotizacionInsumo,
                            as: 'insumos',
                            include: [{ model: Insumo, as: 'insumo' }]
                        }
                    ]
                }
            ]
        });
        res.json(cotizaciones);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener cotizaciones',
            error: error.message
        });
    }
};

// Obtener una cotización por ID
exports.getCotizacionById = async (req, res) => {
    try {
        const cotizacion = await Cotizacion.findByPk(req.params.id, {
            include: [
                {
                    model: Usuario,
                    as: 'usuario'
                },
                {
                    model: Estado,
                    as: 'estado'
                },
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        {
                            model: Producto,
                            as: 'producto'
                        },
                        {
                            model: CotizacionTecnica,
                            as: 'tecnicas',
                            include: [
                                { model: Tecnica, as: 'tecnica' },
                                { model: Parte, as: 'parte' }
                            ]
                        },
                        {
                            model: CotizacionTalla,
                            as: 'tallas',
                            include: [{ model: Talla, as: 'talla' }]
                        },
                        {
                            model: CotizacionColor,
                            as: 'colores',
                            include: [{ model: Color, as: 'color' }]
                        },
                        {
                            model: CotizacionInsumo,
                            as: 'insumos',
                            include: [{ model: Insumo, as: 'insumo' }]
                        }
                    ]
                }
            ]
        });

        if (!cotizacion) {
            return res.status(404).json({ message: 'Cotización no encontrada' });
        }

        res.json(cotizacion);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener cotización',
            error: error.message
        });
    }
};

// Crear una nueva cotización (SIMPLE - solo la cabecera)
exports.createCotizacion = async (req, res) => {
    try {
        const { DocumentoID, FechaCotizacion, ValorTotal, EstadoID } = req.body;

        // Validar que el usuario existe
        const usuario = await Usuario.findByPk(DocumentoID);
        if (!usuario) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado',
                DocumentoID: DocumentoID 
            });
        }

        // Validar que el estado existe
        if (EstadoID) {
            const estado = await Estado.findByPk(EstadoID);
            if (!estado) {
                return res.status(404).json({ 
                    message: 'Estado no encontrado',
                    EstadoID: EstadoID 
                });
            }
        }

        // Crear la cotización (AHORA SÍ CON DocumentoID)
        const nuevaCotizacion = await Cotizacion.create({
            DocumentoID,  // ✅ AGREGADO
            FechaCotizacion: FechaCotizacion || new Date(),
            ValorTotal: ValorTotal || 0,
            EstadoID
        });

        res.status(201).json({
            message: 'Cotización creada exitosamente',
            cotizacion: nuevaCotizacion
        });
    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({
            message: 'Error al crear cotización',
            error: error.message
        });
    }
};

// Crear una cotización completa (con todos los detalles)
exports.createCotizacionCompleta = async (req, res) => {
    try {
        const {
            DocumentoID,
            FechaCotizacion,
            ValorTotal,
            EstadoID,
            detalles // Array de detalles con sus técnicas, tallas, colores, etc.
        } = req.body;

        // Validar que el usuario existe
        const usuario = await Usuario.findByPk(DocumentoID);
        if (!usuario) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado',
                DocumentoID: DocumentoID 
            });
        }

        // Crear la cotización
        const nuevaCotizacion = await Cotizacion.create({
            DocumentoID,
            FechaCotizacion: FechaCotizacion || new Date(),
            ValorTotal: ValorTotal || 0,
            EstadoID
        });

        // Crear los detalles si vienen
        if (detalles && detalles.length > 0) {
            for (const detalle of detalles) {
                const nuevoDetalle = await DetalleCotizacion.create({
                    CotizacionID: nuevaCotizacion.CotizacionID,
                    ProductoID: detalle.ProductoID,
                    Cantidad: detalle.Cantidad,
                    TraePrenda: detalle.TraePrenda || false,
                    PrendaDescripcion: detalle.PrendaDescripcion
                });

                // Crear técnicas asociadas
                if (detalle.tecnicas && detalle.tecnicas.length > 0) {
                    const tecnicasData = detalle.tecnicas.map(t => ({
                        DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                        TecnicaID: t.TecnicaID,
                        ParteID: t.ParteID,
                        ImagenDiseño: t.ImagenDiseño,
                        Observaciones: t.Observaciones,
                        CostoTecnica: t.CostoTecnica || 0
                    }));
                    await CotizacionTecnica.bulkCreate(tecnicasData);
                }

                // Crear tallas asociadas
                if (detalle.tallas && detalle.tallas.length > 0) {
                    const tallasData = detalle.tallas.map(t => ({
                        DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                        TallaID: t.TallaID,
                        Cantidad: t.Cantidad,
                        PrecioTalla: t.PrecioTalla
                    }));
                    await CotizacionTalla.bulkCreate(tallasData);
                }

                // Crear colores asociados
                if (detalle.colores && detalle.colores.length > 0) {
                    const coloresData = detalle.colores.map(c => ({
                        DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                        ColorID: c.ColorID,
                        Cantidad: c.Cantidad
                    }));
                    await CotizacionColor.bulkCreate(coloresData);
                }

                // Crear insumos asociados
                if (detalle.insumos && detalle.insumos.length > 0) {
                    const insumosData = detalle.insumos.map(i => ({
                        DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                        InsumoID: i.InsumoID,
                        CantidadRequerida: i.CantidadRequerida
                    }));
                    await CotizacionInsumo.bulkCreate(insumosData);
                }
            }
        }

        // Retornar la cotización completa
        const cotizacionCompleta = await Cotizacion.findByPk(nuevaCotizacion.CotizacionID, {
            include: [
                {
                    model: Usuario,
                    as: 'usuario'
                },
                {
                    model: Estado,
                    as: 'estado'
                },
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        { model: Producto, as: 'producto' },
                        { model: CotizacionTecnica, as: 'tecnicas' },
                        { model: CotizacionTalla, as: 'tallas' },
                        { model: CotizacionColor, as: 'colores' },
                        { model: CotizacionInsumo, as: 'insumos' }
                    ]
                }
            ]
        });

        res.status(201).json({
            message: 'Cotización completa creada exitosamente',
            cotizacion: cotizacionCompleta
        });
    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({
            message: 'Error al crear cotización completa',
            error: error.message
        });
    }
};

// Actualizar una cotización
exports.updateCotizacion = async (req, res) => {
    try {
        const { ValorTotal, EstadoID } = req.body;

        const cotizacion = await Cotizacion.findByPk(req.params.id);

        if (!cotizacion) {
            return res.status(404).json({ message: 'Cotización no encontrada' });
        }

        await cotizacion.update({
            ValorTotal: ValorTotal !== undefined ? ValorTotal : cotizacion.ValorTotal,
            EstadoID: EstadoID || cotizacion.EstadoID
        });

        res.json({
            message: 'Cotización actualizada exitosamente',
            cotizacion
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar cotización',
            error: error.message
        });
    }
};

// Eliminar una cotización
exports.deleteCotizacion = async (req, res) => {
    try {
        const cotizacion = await Cotizacion.findByPk(req.params.id);

        if (!cotizacion) {
            return res.status(404).json({ message: 'Cotización no encontrada' });
        }

        await cotizacion.destroy();

        res.json({ message: 'Cotización eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar cotización',
            error: error.message
        });
    }
};