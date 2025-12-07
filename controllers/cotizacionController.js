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
    Parte,
    Venta,
    DetalleVenta,
    InventarioProducto
} = require('../models');

// ============================================
// FUNCIÓN PRINCIPAL: CREAR COTIZACIÓN INTELIGENTE
// ============================================
exports.createCotizacionInteligente = async (req, res) => {
    try {
        const { DocumentoID, FechaCotizacion, detalles } = req.body;

        console.log('\n' + '='.repeat(60));
        console.log('ANÁLISIS DE COTIZACIÓN INTELIGENTE');
        console.log('='.repeat(60));
        console.log('DocumentoID:', DocumentoID);
        console.log('Detalles recibidos:', detalles?.length || 0);

        // ========================================
        // VALIDACIONES BÁSICAS
        // ========================================
        if (!DocumentoID) {
            return res.status(400).json({
                message: 'DocumentoID es obligatorio',
                receivedData: req.body
            });
        }

        if (!detalles || detalles.length === 0) {
            return res.status(400).json({
                message: 'Debe incluir al menos un producto',
                receivedData: req.body
            });
        }

        // Validar que el usuario existe
        const usuario = await Usuario.findByPk(DocumentoID);
        if (!usuario) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado',
                DocumentoID: DocumentoID
            });
        }

        console.log('Usuario encontrado:', usuario.Nombre);

        // ========================================
        // DETECTAR SI HAY DISEÑOS (TÉCNICAS)
        // ========================================
        const tieneDiseños = detalles.some(detalle => 
            detalle.tecnicas && 
            Array.isArray(detalle.tecnicas) && 
            detalle.tecnicas.length > 0
        );

        console.log('\nAnálisis de contenido:');
        console.log('   - Tiene diseños aplicados:', tieneDiseños ? 'SÍ' : 'NO');

        // ========================================
        // DECISIÓN: COTIZACIÓN O VENTA DIRECTA
        // ========================================
        if (!tieneDiseños) {
            console.log('\nRUTA: VENTA DIRECTA (sin diseños)');
            console.log('   → Se creará una VENTA PENDIENTE');
            return await crearVentaDirecta(req, res, { DocumentoID, FechaCotizacion, detalles, usuario });
        } else {
            console.log('\nRUTA: COTIZACIÓN (con diseños)');
            console.log('   → Se creará una COTIZACIÓN normal');
            return await crearCotizacionConDiseños(req, res, { DocumentoID, FechaCotizacion, detalles, usuario });
        }

    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('ERROR EN COTIZACIÓN INTELIGENTE');
        console.error('='.repeat(60));
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('='.repeat(60) + '\n');
        
        res.status(500).json({
            message: 'Error al procesar la solicitud',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ============================================
// CREAR VENTA DIRECTA (SIN DISEÑOS) + DESCUENTO DE STOCK
// ============================================
async function crearVentaDirecta(req, res, { DocumentoID, FechaCotizacion, detalles, usuario }) {
    try {
        console.log('\nCREANDO VENTA DIRECTA...');

        let subtotal = 0;
        const detallesCalculados = [];

        // ========================================
        // PASO 1: VALIDAR STOCK DISPONIBLE
        // ========================================
        console.log('\n🔍 VALIDANDO STOCK DISPONIBLE...');
        for (const detalle of detalles) {
            const colorID = detalle.colores?.[0]?.ColorID;
            const tallaID = detalle.tallas?.[0]?.TallaID;
            const cantidad = parseInt(detalle.Cantidad);

            if (!colorID || !tallaID) {
                throw new Error('Se requiere Color y Talla para validar stock');
            }

            // Buscar variante en inventario
            const variante = await InventarioProducto.findOne({
                where: {
                    ProductoID: detalle.ProductoID,
                    ColorID: colorID,
                    TallaID: tallaID
                }
            });

            if (!variante) {
                throw new Error(
                    `No existe variante para Producto ${detalle.ProductoID}, ` +
                    `Color ${colorID}, Talla ${tallaID}`
                );
            }

            if (variante.Stock < cantidad) {
                throw new Error(
                    `Stock insuficiente para ${variante.producto?.Nombre || 'producto'}. ` +
                    `Disponible: ${variante.Stock}, Solicitado: ${cantidad}`
                );
            }

            console.log(`   ✓ Stock validado - Producto ${detalle.ProductoID}: ${variante.Stock} disponibles`);
        }

        // ========================================
        // PASO 2: CALCULAR PRECIOS
        // ========================================
        console.log('\n💰 CALCULANDO PRECIOS...');
        for (const detalle of detalles) {
            const producto = await Producto.findByPk(detalle.ProductoID);
            if (!producto) {
                throw new Error(`Producto ${detalle.ProductoID} no encontrado`);
            }

            const tallaID = detalle.tallas?.[0]?.TallaID;
            const talla = tallaID ? await Talla.findByPk(tallaID) : null;

            const insumoID = detalle.insumos?.[0]?.InsumoID;
            const tela = insumoID ? await Insumo.findByPk(insumoID) : null;

            const colorID = detalle.colores?.[0]?.ColorID;

            const precioBase = parseFloat(producto.PrecioBase) || 0;
            const precioTalla = parseFloat(talla?.Precio) || 0;
            const precioTela = parseFloat(tela?.PrecioTela) || 0;
            const precioUnitario = precioBase + precioTalla + precioTela;
            const subtotalDetalle = precioUnitario * detalle.Cantidad;

            console.log(`   - ${producto.Nombre}:`);
            console.log(`     Precio base: $${precioBase.toLocaleString()}`);
            console.log(`     Precio talla: $${precioTalla.toLocaleString()}`);
            console.log(`     Precio tela: $${precioTela.toLocaleString()}`);
            console.log(`     Precio unitario: $${precioUnitario.toLocaleString()}`);
            console.log(`     Cantidad: ${detalle.Cantidad}`);
            console.log(`     Subtotal: $${subtotalDetalle.toLocaleString()}`);

            subtotal += subtotalDetalle;

            detallesCalculados.push({
                ProductoID: detalle.ProductoID,
                ColorID: colorID || null,
                TallaID: tallaID || null,
                Cantidad: detalle.Cantidad,
                PrecioUnitario: precioUnitario
            });
        }

        console.log(`\n📊 Subtotal total: $${subtotal.toLocaleString()}`);

        // ========================================
        // PASO 3: CREAR LA VENTA
        // ========================================
        console.log('\n📝 CREANDO VENTA...');
        const nuevaVenta = await Venta.create({
            DocumentoID,
            FechaVenta: FechaCotizacion || new Date(),
            Subtotal: subtotal,
            Total: subtotal,
            EstadoID: 8 // PENDIENTE
        });

        console.log(`✓ Venta creada con ID: ${nuevaVenta.VentaID}`);

        // ========================================
        // PASO 4: CREAR DETALLES DE VENTA
        // ========================================
        for (const detalle of detallesCalculados) {
            await DetalleVenta.create({
                VentaID: nuevaVenta.VentaID,
                ...detalle
            });
        }

        console.log(`✓ ${detallesCalculados.length} detalles de venta creados`);

        // ========================================
        // PASO 5: DESCONTAR STOCK INMEDIATAMENTE
        // ========================================
        console.log('\n📦 DESCONTANDO STOCK...');
        for (const detalle of detallesCalculados) {
            await InventarioProducto.decrement(
                'Stock',
                {
                    by: detalle.Cantidad,
                    where: {
                        ProductoID: detalle.ProductoID,
                        ColorID: detalle.ColorID,
                        TallaID: detalle.TallaID
                    }
                }
            );

            console.log(`   ✓ Descontado ${detalle.Cantidad} unidades de Producto ${detalle.ProductoID}`);
        }

        console.log('='.repeat(60) + '\n');

        return res.status(201).json({
            tipo: 'venta',
            message: 'Venta pendiente creada exitosamente',
            mensaje: 'Tu pedido ha sido registrado y está pendiente de procesamiento. El stock ha sido reservado.',
            venta: nuevaVenta,
            detalles: detallesCalculados
        });

    } catch (error) {
        console.error('❌ Error al crear venta directa:', error);
        throw error;
    }
}

// ============================================
// CREAR COTIZACIÓN CON DISEÑOS (SIN DESCUENTO DE STOCK)
// ============================================
async function crearCotizacionConDiseños(req, res, { DocumentoID, FechaCotizacion, detalles, usuario }) {
    try {
        console.log('\nCREANDO COTIZACIÓN CON DISEÑOS...');
        console.log('⚠️  El stock NO se descuenta en cotizaciones (solo es presupuesto)');

        // Crear la cotización con estado "Pendiente" (EstadoID = 1)
        const nuevaCotizacion = await Cotizacion.create({
            DocumentoID,
            FechaCotizacion: FechaCotizacion || new Date(),
            ValorTotal: 0,
            EstadoID: 1 // PENDIENTE
        });

        console.log(`Cotización creada con ID: ${nuevaCotizacion.CotizacionID}`);

        // Crear los detalles con todos sus datos
        for (let i = 0; i < detalles.length; i++) {
            const detalle = detalles[i];
            console.log(`\n   Detalle ${i + 1}/${detalles.length}:`);
            
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

            // Crear tallas, colores, insumos
            if (detalle.tallas && detalle.tallas.length > 0) {
                await CotizacionTalla.bulkCreate(detalle.tallas.map(t => ({
                    DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                    TallaID: t.TallaID,
                    Cantidad: t.Cantidad,
                    PrecioTalla: t.PrecioTalla || 0
                })));
            }

            if (detalle.colores && detalle.colores.length > 0) {
                await CotizacionColor.bulkCreate(detalle.colores.map(c => ({
                    DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                    ColorID: c.ColorID,
                    Cantidad: c.Cantidad
                })));
            }

            if (detalle.insumos && detalle.insumos.length > 0) {
                await CotizacionInsumo.bulkCreate(detalle.insumos.map(i => ({
                    DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                    InsumoID: i.InsumoID,
                    CantidadRequerida: i.CantidadRequerida
                })));
            }
        }

        // Retornar la cotización completa
        const cotizacionCompleta = await Cotizacion.findByPk(nuevaCotizacion.CotizacionID, {
            include: [
                { model: Usuario, as: 'usuario' },
                { model: Estado, as: 'estado' },
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        { model: Producto, as: 'producto' },
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

        console.log('='.repeat(60));
        console.log('COTIZACIÓN CON DISEÑOS CREADA EXITOSAMENTE');
        console.log('='.repeat(60) + '\n');

        return res.status(201).json({
            tipo: 'cotizacion',
            message: 'Cotización creada exitosamente',
            mensaje: 'Tu cotización ha sido registrada. El administrador asignará los costos de los diseños y te contactará pronto. El stock se descontará cuando se convierta en venta.',
            cotizacion: cotizacionCompleta
        });

    } catch (error) {
        console.error('Error al crear cotización con diseños:', error);
        throw error;
    }
}

// ============================================
// NUEVA FUNCIÓN: CONVERTIR COTIZACIÓN A VENTA
// ============================================
exports.convertirCotizacionAVenta = async (req, res) => {
    try {
        const { cotizacionID } = req.params;

        console.log('\n' + '='.repeat(60));
        console.log('CONVIRTIENDO COTIZACIÓN A VENTA');
        console.log('='.repeat(60));

        // Obtener cotización completa
        const cotizacion = await Cotizacion.findByPk(cotizacionID, {
            include: [
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        { model: Producto, as: 'producto' },
                        { model: CotizacionTalla, as: 'tallas', include: [{ model: Talla, as: 'talla' }] },
                        { model: CotizacionColor, as: 'colores' },
                        { model: CotizacionInsumo, as: 'insumos', include: [{ model: Insumo, as: 'insumo' }] },
                        { model: CotizacionTecnica, as: 'tecnicas' }
                    ]
                }
            ]
        });

        if (!cotizacion) {
            return res.status(404).json({ message: 'Cotización no encontrada' });
        }

        if (cotizacion.EstadoID !== 2) { // 2 = Aprobada
            return res.status(400).json({ 
                message: 'Solo se pueden convertir cotizaciones aprobadas',
                estadoActual: cotizacion.EstadoID
            });
        }

        // ========================================
        // VALIDAR STOCK DISPONIBLE
        // ========================================
        console.log('\n🔍 VALIDANDO STOCK...');
        for (const detalle of cotizacion.detalles) {
            const colorID = detalle.colores?.[0]?.ColorID;
            const tallaID = detalle.tallas?.[0]?.TallaID;

            if (!colorID || !tallaID) {
                throw new Error('Cotización sin color/talla especificada');
            }

            const variante = await InventarioProducto.findOne({
                where: {
                    ProductoID: detalle.ProductoID,
                    ColorID: colorID,
                    TallaID: tallaID
                }
            });

            if (!variante || variante.Stock < detalle.Cantidad) {
                throw new Error(
                    `Stock insuficiente para ${detalle.producto?.Nombre}. ` +
                    `Disponible: ${variante?.Stock || 0}, Necesario: ${detalle.Cantidad}`
                );
            }
        }

        // ========================================
        // CREAR VENTA
        // ========================================
        console.log('\n📝 CREANDO VENTA...');
        const nuevaVenta = await Venta.create({
            DocumentoID: cotizacion.DocumentoID,
            FechaVenta: new Date(),
            Subtotal: cotizacion.ValorTotal,
            Total: cotizacion.ValorTotal,
            EstadoID: 8 // PENDIENTE
        });

        // Crear detalles de venta
        for (const detalle of cotizacion.detalles) {
            const tallaID = detalle.tallas?.[0]?.TallaID;
            const colorID = detalle.colores?.[0]?.ColorID;
            
            // Calcular precio unitario
            const precioBase = parseFloat(detalle.producto.PrecioBase) || 0;
            const precioTalla = parseFloat(detalle.tallas?.[0]?.talla?.Precio) || 0;
            const precioTela = parseFloat(detalle.insumos?.[0]?.insumo?.PrecioTela) || 0;
            const costoTecnicas = detalle.tecnicas?.reduce((sum, t) => sum + (parseFloat(t.CostoTecnica) || 0), 0) || 0;
            const precioUnitario = precioBase + precioTalla + precioTela + costoTecnicas;

            await DetalleVenta.create({
                VentaID: nuevaVenta.VentaID,
                ProductoID: detalle.ProductoID,
                ColorID: colorID,
                TallaID: tallaID,
                Cantidad: detalle.Cantidad,
                PrecioUnitario: precioUnitario
            });

            // DESCONTAR STOCK
            await InventarioProducto.decrement('Stock', {
                by: detalle.Cantidad,
                where: {
                    ProductoID: detalle.ProductoID,
                    ColorID: colorID,
                    TallaID: tallaID
                }
            });

            console.log(`   ✓ Stock descontado: ${detalle.Cantidad} unidades`);
        }

        // Actualizar estado de cotización a "Convertida" (puedes crear un nuevo estado si quieres)
        await cotizacion.update({ EstadoID: 3 }); // 3 = Convertida/Procesada

        console.log('='.repeat(60));
        console.log('CONVERSIÓN EXITOSA');
        console.log('='.repeat(60) + '\n');

        return res.status(201).json({
            message: 'Cotización convertida a venta exitosamente',
            venta: nuevaVenta,
            cotizacionID: cotizacion.CotizacionID
        });

    } catch (error) {
        console.error('Error al convertir cotización:', error);
        res.status(500).json({
            message: 'Error al convertir cotización',
            error: error.message
        });
    }
};

// ============================================
// MANTENER FUNCIONES ORIGINALES
// ============================================
exports.getAllCotizaciones = async (req, res) => {
    try {
        const cotizaciones = await Cotizacion.findAll({
            include: [
                { model: Usuario, as: 'usuario' },
                { model: Estado, as: 'estado' },
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        { model: Producto, as: 'producto' },
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

exports.getCotizacionById = async (req, res) => {
    try {
        const cotizacion = await Cotizacion.findByPk(req.params.id, {
            include: [
                { model: Usuario, as: 'usuario' },
                { model: Estado, as: 'estado' },
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        { model: Producto, as: 'producto' },
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

const calcularValorTotalCotizacion = async (cotizacionID) => {
    try {
        const cotizacion = await Cotizacion.findByPk(cotizacionID, {
            include: [
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        { model: Producto, as: 'producto' },
                        { model: CotizacionTecnica, as: 'tecnicas' },
                        { model: CotizacionTalla, as: 'tallas', include: [{ model: Talla, as: 'talla' }] },
                        { model: CotizacionInsumo, as: 'insumos', include: [{ model: Insumo, as: 'insumo' }] }
                    ]
                }
            ]
        });

        if (!cotizacion) return 0;

        let total = 0;

        for (const detalle of cotizacion.detalles) {
            let subtotalDetalle = 0;
            
            const precioBase = parseFloat(detalle.producto?.PrecioBase || 0);
            subtotalDetalle += precioBase * detalle.Cantidad;

            if (detalle.insumos && detalle.insumos.length > 0) {
                for (const insumo of detalle.insumos) {
                    const precioTela = parseFloat(insumo.insumo?.PrecioTela || 0);
                    const cantidadRequerida = parseFloat(insumo.CantidadRequerida || 0);
                    subtotalDetalle += precioTela * cantidadRequerida;
                }
            }

            if (detalle.tallas && detalle.tallas.length > 0) {
                for (const talla of detalle.tallas) {
                    const precioTalla = parseFloat(talla.talla?.Precio || 0);
                    const cantidadTalla = parseInt(talla.Cantidad || 0);
                    subtotalDetalle += precioTalla * cantidadTalla;
                }
            }

            if (detalle.tecnicas && detalle.tecnicas.length > 0) {
                for (const tecnica of detalle.tecnicas) {
                    const costoTecnica = parseFloat(tecnica.CostoTecnica || 0);
                    subtotalDetalle += costoTecnica * detalle.Cantidad;
                }
            }

            total += subtotalDetalle;
        }

        await cotizacion.update({ ValorTotal: total });
        return total;
    } catch (error) {
        console.error('Error recalculando valor total:', error);
        return 0;
    }
};

exports.calcularValorTotalCotizacion = calcularValorTotalCotizacion;