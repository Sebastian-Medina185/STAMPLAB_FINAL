// controllers/cotizaciontecnicaController.js
const { CotizacionTecnica, DetalleCotizacion, Cotizacion, CotizacionTalla, CotizacionInsumo, Talla, Producto, Insumo } = require('../models');

// Actualizar técnica y recalcular total
exports.updateCotizacionTecnica = async (req, res) => {
    try {
        const { CostoTecnica, ImagenDiseño, Observaciones } = req.body;

        const cotizacionTecnica = await CotizacionTecnica.findByPk(req.params.id, {
            include: [{ 
                model: DetalleCotizacion, 
                as: 'detalleCotizacion',
                include: [{ model: Cotizacion, as: 'cotizacion' }]
            }]
        });

        if (!cotizacionTecnica) {
            return res.status(404).json({ message: 'Técnica de cotización no encontrada' });
        }

        // Actualizar costo de técnica
        await cotizacionTecnica.update({
            CostoTecnica: CostoTecnica !== undefined ? parseFloat(CostoTecnica) : cotizacionTecnica.CostoTecnica,
            ImagenDiseño: ImagenDiseño || cotizacionTecnica.ImagenDiseño,
            Observaciones: Observaciones || cotizacionTecnica.Observaciones
        });

        // RECALCULAR VALOR TOTAL
        const cotizacionID = cotizacionTecnica.detalleCotizacion?.CotizacionID;
        if (cotizacionID) {
            const nuevoTotal = await recalcularValorTotal(cotizacionID);
            return res.json({
                message: 'Técnica actualizada y total recalculado',
                cotizacionTecnica,
                nuevoTotal
            });
        }

        res.json({
            message: 'Técnica de cotización actualizada',
            cotizacionTecnica
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error al actualizar técnica de cotización',
            error: error.message
        });
    }
};

// FUNCIÓN CORREGIDA PARA RECALCULAR VALOR TOTAL
async function recalcularValorTotal(cotizacionID) {
    try {
        const cotizacion = await Cotizacion.findByPk(cotizacionID, {
            include: [{
                model: DetalleCotizacion,
                as: 'detalles',
                include: [
                    {
                        model: Producto,
                        as: 'producto'
                    },
                    {
                        model: CotizacionTecnica,
                        as: 'tecnicas'
                    },
                    {
                        model: CotizacionTalla,
                        as: 'tallas',
                        include: [{ model: Talla, as: 'talla' }]
                    },
                    {
                        // IMPORTANTE: Incluir insumos (telas)
                        model: CotizacionInsumo,
                        as: 'insumos',
                        include: [{ model: Insumo, as: 'insumo' }]
                    }
                ]
            }]
        });

        if (!cotizacion) {
            console.log('Cotización no encontrada');
            return 0;
        }

        let total = 0;

        console.log('Recalculando valor total para cotización #' + cotizacionID);

        // Calcular total por cada detalle
        for (const detalle of cotizacion.detalles) {
            let subtotalDetalle = 0;
            
            console.log(`\nDetalle #${detalle.DetalleCotizacionID}`);
            console.log(`   Producto: ${detalle.producto?.Nombre}`);
            console.log(`   Cantidad: ${detalle.Cantidad}`);

            // 1. Precio base del producto
            const precioBase = parseFloat(detalle.producto?.PrecioBase || 0);
            const subtotalBase = precioBase * detalle.Cantidad;
            subtotalDetalle += subtotalBase;
            console.log(`Precio base: $${precioBase.toLocaleString()} x ${detalle.Cantidad} = $${subtotalBase.toLocaleString()}`);

            // 2. Sumar costos de TELAS (INSUMOS)
            if (detalle.insumos && detalle.insumos.length > 0) {
                for (const insumo of detalle.insumos) {
                    const precioTela = parseFloat(insumo.insumo?.PrecioTela || 0);
                    const cantidadRequerida = parseFloat(insumo.CantidadRequerida || 0);
                    const subtotalTela = precioTela * cantidadRequerida;
                    subtotalDetalle += subtotalTela;
                    console.log(` Tela (${insumo.insumo?.Nombre}): $${precioTela.toLocaleString()} x ${cantidadRequerida} = $${subtotalTela.toLocaleString()}`);
                }
            }

            // 3. Sumar costos de TALLAS
            if (detalle.tallas && detalle.tallas.length > 0) {
                for (const talla of detalle.tallas) {
                    const precioTalla = parseFloat(talla.talla?.Precio || 0);
                    const cantidadTalla = parseInt(talla.Cantidad || 0);
                    const subtotalTalla = precioTalla * cantidadTalla;
                    subtotalDetalle += subtotalTalla;
                    console.log(`Talla (${talla.talla?.Nombre}): $${precioTalla.toLocaleString()} x ${cantidadTalla} = $${subtotalTalla.toLocaleString()}`);
                }
            }

            // 4. Sumar costos de TÉCNICAS
            if (detalle.tecnicas && detalle.tecnicas.length > 0) {
                for (const tecnica of detalle.tecnicas) {
                    const costoTecnica = parseFloat(tecnica.CostoTecnica || 0);
                    const subtotalTecnica = costoTecnica * detalle.Cantidad;
                    subtotalDetalle += subtotalTecnica;
                    console.log(`Técnica: $${costoTecnica.toLocaleString()} x ${detalle.Cantidad} = $${subtotalTecnica.toLocaleString()}`);
                }
            }

            console.log(`Subtotal detalle: $${subtotalDetalle.toLocaleString()}`);
            total += subtotalDetalle;
        }

        console.log(`\nVALOR TOTAL FINAL: $${total.toLocaleString()}\n`);

        // Actualizar el valor total en la BD
        await cotizacion.update({ ValorTotal: total });
        
        return total;
    } catch (error) {
        console.error('Error recalculando valor total:', error);
        return 0;
    }
}

// Exportar funciones
exports.recalcularValorTotal = recalcularValorTotal;

// Obtener todas las técnicas
exports.getAllCotizacionTecnicas = async (req, res) => {
    try {
        const tecnicas = await CotizacionTecnica.findAll({
            include: ['tecnica', 'parte']
        });
        res.json(tecnicas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener técnica por ID
exports.getCotizacionTecnicaById = async (req, res) => {
    try {
        const tecnica = await CotizacionTecnica.findByPk(req.params.id, {
            include: ['tecnica', 'parte']
        });
        if (!tecnica) {
            return res.status(404).json({ message: 'Técnica no encontrada' });
        }
        res.json(tecnica);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear técnica
exports.createCotizacionTecnica = async (req, res) => {
    try {
        const tecnica = await CotizacionTecnica.create(req.body);
        res.status(201).json(tecnica);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar técnica
exports.deleteCotizacionTecnica = async (req, res) => {
    try {
        const tecnica = await CotizacionTecnica.findByPk(req.params.id, {
            include: [{ 
                model: DetalleCotizacion, 
                as: 'detalleCotizacion'
            }]
        });
        
        if (!tecnica) {
            return res.status(404).json({ message: 'Técnica no encontrada' });
        }

        const cotizacionID = tecnica.detalleCotizacion?.CotizacionID;
        
        await tecnica.destroy();
        
        // Recalcular total después de eliminar
        if (cotizacionID) {
            await recalcularValorTotal(cotizacionID);
        }
        
        res.json({ message: 'Técnica eliminada y total recalculado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};