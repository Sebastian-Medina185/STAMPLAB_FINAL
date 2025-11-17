const {
    Cotizacion,
    DetalleCotizacion,
    Estado,
    Usuario,
    CotizacionTecnica,
    CotizacionTalla,
    CotizacionColor,
    CotizacionInsumo,
    CotizacionProducto,
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
                    model: Estado,
                    as: 'estado'
                },
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        {
                            model: Usuario,
                            as: 'usuario'
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
                            model: CotizacionProducto,
                            as: 'productos',
                            include: [{ model: Producto, as: 'producto' }]
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
                    model: Estado,
                    as: 'estado'
                },
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        {
                            model: Usuario,
                            as: 'usuario'
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
                        },
                        {
                            model: CotizacionProducto,
                            as: 'productos',
                            include: [{ model: Producto, as: 'producto' }]
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

// Crear una nueva cotización completa
exports.createCotizacion = async (req, res) => {
    try {
        const {
            FechaCotizacion,
            ValorTotal,
            EstadoID,
            DocumentoID,
            Cantidad,
            TraePrenda,
            PrendaDescripcion,
            tecnicas,
            tallas,
            colores,
            insumos,
            productos
        } = req.body;

        // Crear la cotización
        const nuevaCotizacion = await Cotizacion.create({
            FechaCotizacion: FechaCotizacion || new Date(),
            ValorTotal: ValorTotal || 0,
            EstadoID
        });

        // Crear el detalle de cotización
        const nuevoDetalle = await DetalleCotizacion.create({
            DocumentoID,
            CotizacionID: nuevaCotizacion.CotizacionID,
            Cantidad,
            TraePrenda: TraePrenda || false,
            PrendaDescripcion
        });

        // Crear técnicas asociadas
        if (tecnicas && tecnicas.length > 0) {
            const tecnicasData = tecnicas.map(t => ({
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
        if (tallas && tallas.length > 0) {
            const tallasData = tallas.map(t => ({
                DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                TallaID: t.TallaID,
                Cantidad: t.Cantidad,
                PrecioTalla: t.PrecioTalla
            }));
            await CotizacionTalla.bulkCreate(tallasData);
        }

        // Crear colores asociados
        if (colores && colores.length > 0) {
            const coloresData = colores.map(c => ({
                DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                ColorID: c.ColorID,
                Cantidad: c.Cantidad
            }));
            await CotizacionColor.bulkCreate(coloresData);
        }

        // Crear insumos asociados
        if (insumos && insumos.length > 0) {
            const insumosData = insumos.map(i => ({
                DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                InsumoID: i.InsumoID,
                CantidadRequerida: i.CantidadRequerida
            }));
            await CotizacionInsumo.bulkCreate(insumosData);
        }

        // Crear productos asociados
        if (productos && productos.length > 0) {
            const productosData = productos.map(p => ({
                DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                ProductoID: p.ProductoID,
                Cantidad: p.Cantidad,
                PrecioUnitario: p.PrecioUnitario,
                Subtotal: p.Subtotal
            }));
            await CotizacionProducto.bulkCreate(productosData);
        }

        // Retornar la cotización completa
        const cotizacionCompleta = await Cotizacion.findByPk(nuevaCotizacion.CotizacionID, {
            include: [
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        { model: CotizacionTecnica, as: 'tecnicas' },
                        { model: CotizacionTalla, as: 'tallas' },
                        { model: CotizacionColor, as: 'colores' },
                        { model: CotizacionInsumo, as: 'insumos' },
                        { model: CotizacionProducto, as: 'productos' }
                    ]
                }
            ]
        });

        res.status(201).json({
            message: 'Cotización creada exitosamente',
            cotizacion: cotizacionCompleta
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear cotización',
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