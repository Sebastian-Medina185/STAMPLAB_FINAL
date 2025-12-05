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

        console.log('Creando cotización simple con DocumentoID:', DocumentoID);

        // Validar que el usuario existe
        const usuario = await Usuario.findByPk(DocumentoID);
        if (!usuario) {
            console.error('Usuario no encontrado:', DocumentoID);
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

        // Crear la cotización
        const nuevaCotizacion = await Cotizacion.create({
            DocumentoID,
            FechaCotizacion: FechaCotizacion || new Date(),
            ValorTotal: ValorTotal || 0,
            EstadoID
        });

        console.log('Cotización creada exitosamente:', nuevaCotizacion.CotizacionID);

        res.status(201).json({
            message: 'Cotización creada exitosamente',
            cotizacion: nuevaCotizacion
        });
    } catch (error) {
        console.error('Error completo al crear cotización:', error);
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
            detalles
        } = req.body;

        console.log('\n' + '='.repeat(60));
        console.log('CREAR COTIZACIÓN COMPLETA - INICIO');
        console.log('='.repeat(60));
        console.log('DocumentoID recibido:', DocumentoID);
        console.log('Tipo de DocumentoID:', typeof DocumentoID);
        console.log('EstadoID:', EstadoID);
        console.log('Cantidad de detalles:', detalles?.length || 0);
        console.log('='.repeat(60));

        // Validar datos obligatorios
        if (!DocumentoID) {
            console.error('ERROR: DocumentoID no proporcionado');
            return res.status(400).json({
                message: 'DocumentoID es obligatorio',
                receivedData: req.body
            });
        }

        // Validar que el usuario existe
        console.log('Buscando usuario con DocumentoID:', DocumentoID);
        const usuario = await Usuario.findByPk(DocumentoID);
        
        if (!usuario) {
            console.error('ERROR: Usuario NO encontrado en la base de datos');
            console.error('DocumentoID buscado:', DocumentoID);
            
            // Listar algunos usuarios para debug
            const todosUsuarios = await Usuario.findAll({
                attributes: ['DocumentoID', 'Nombre'],
                limit: 5
            });
            console.log('Usuarios disponibles en BD (primeros 5):');
            todosUsuarios.forEach(u => {
                console.log(`   - DocumentoID: ${u.DocumentoID} (${typeof u.DocumentoID}), Nombre: ${u.Nombre}`);
            });
            
            return res.status(404).json({ 
                message: 'Usuario no encontrado',
                DocumentoID: DocumentoID,
                tipoRecibido: typeof DocumentoID,
                debug: 'Verifica que el DocumentoID exista en la base de datos'
            });
        }

        console.log('Usuario encontrado:', usuario.Nombre, '(Doc:', usuario.DocumentoID, ')');

        // Crear la cotización
        console.log('Creando cotización...');
        const nuevaCotizacion = await Cotizacion.create({
            DocumentoID,
            FechaCotizacion: FechaCotizacion || new Date(),
            ValorTotal: ValorTotal || 0,
            EstadoID
        });

        console.log('Cotización creada con ID:', nuevaCotizacion.CotizacionID);

        // Crear los detalles si vienen
        if (detalles && detalles.length > 0) {
            console.log(`Procesando ${detalles.length} detalles...`);
            
            for (let i = 0; i < detalles.length; i++) {
                const detalle = detalles[i];
                console.log(`\n   Detalle ${i + 1}/${detalles.length}:`);
                console.log(`      - ProductoID: ${detalle.ProductoID}`);
                console.log(`      - Cantidad: ${detalle.Cantidad}`);
                console.log(`      - TraePrenda: ${detalle.TraePrenda}`);
                
                const nuevoDetalle = await DetalleCotizacion.create({
                    CotizacionID: nuevaCotizacion.CotizacionID,
                    ProductoID: detalle.ProductoID,
                    Cantidad: detalle.Cantidad,
                    TraePrenda: detalle.TraePrenda || false,
                    PrendaDescripcion: detalle.PrendaDescripcion
                });

                console.log(`      Detalle creado con ID: ${nuevoDetalle.DetalleCotizacionID}`);

                // Crear técnicas asociadas
                if (detalle.tecnicas && detalle.tecnicas.length > 0) {
                    console.log(`      Agregando ${detalle.tecnicas.length} técnicas...`);
                    const tecnicasData = detalle.tecnicas.map(t => ({
                        DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                        TecnicaID: t.TecnicaID,
                        ParteID: t.ParteID,
                        ImagenDiseño: t.ImagenDiseño,
                        Observaciones: t.Observaciones,
                        CostoTecnica: t.CostoTecnica || 0
                    }));
                    await CotizacionTecnica.bulkCreate(tecnicasData);
                    console.log(`      ${tecnicasData.length} técnicas agregadas`);
                }

                // Crear tallas asociadas
                if (detalle.tallas && detalle.tallas.length > 0) {
                    console.log(`      Agregando ${detalle.tallas.length} tallas...`);
                    const tallasData = detalle.tallas.map(t => ({
                        DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                        TallaID: t.TallaID,
                        Cantidad: t.Cantidad,
                        PrecioTalla: t.PrecioTalla || 0
                    }));
                    await CotizacionTalla.bulkCreate(tallasData);
                    console.log(`      ${tallasData.length} tallas agregadas`);
                }

                // Crear colores asociados
                if (detalle.colores && detalle.colores.length > 0) {
                    console.log(`      Agregando ${detalle.colores.length} colores...`);
                    const coloresData = detalle.colores.map(c => ({
                        DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                        ColorID: c.ColorID,
                        Cantidad: c.Cantidad
                    }));
                    await CotizacionColor.bulkCreate(coloresData);
                    console.log(`      ${coloresData.length} colores agregados`);
                }

                // Crear insumos asociados
                if (detalle.insumos && detalle.insumos.length > 0) {
                    console.log(`      Agregando ${detalle.insumos.length} insumos...`);
                    const insumosData = detalle.insumos.map(i => ({
                        DetalleCotizacionID: nuevoDetalle.DetalleCotizacionID,
                        InsumoID: i.InsumoID,
                        CantidadRequerida: i.CantidadRequerida
                    }));
                    await CotizacionInsumo.bulkCreate(insumosData);
                    console.log(`      ${insumosData.length} insumos agregados`);
                }
            }
        }

        // Retornar la cotización completa
        console.log('Buscando cotización completa con includes...');
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

        console.log('='.repeat(60));
        console.log('COTIZACIÓN COMPLETA CREADA EXITOSAMENTE');
        console.log('   ID Cotización:', nuevaCotizacion.CotizacionID);
        console.log('   Cliente:', usuario.Nombre);
        console.log('   Detalles:', detalles?.length || 0);
        console.log('='.repeat(60) + '\n');

        res.status(201).json({
            message: 'Cotización completa creada exitosamente',
            cotizacion: cotizacionCompleta
        });
    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('ERROR AL CREAR COTIZACIÓN COMPLETA');
        console.error('='.repeat(60));
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('='.repeat(60) + '\n');
        
        res.status(500).json({
            message: 'Error al crear cotización completa',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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


// controllers/cotizacionController.js - Agregar función auxiliar
const calcularValorTotalCotizacion = async (cotizacionID) => {
    try {
        const cotizacion = await Cotizacion.findByPk(cotizacionID, {
            include: [
                {
                    model: DetalleCotizacion,
                    as: 'detalles',
                    include: [
                        {
                            model: CotizacionTecnica,
                            as: 'tecnicas'
                        },
                        {
                            model: CotizacionTalla,
                            as: 'tallas',
                            include: [{ model: Talla, as: 'talla' }]
                        }
                    ]
                }
            ]
        });

        if (!cotizacion) return 0;

        let total = 0;

        // Sumar costos de técnicas
        for (const detalle of cotizacion.detalles) {
            if (detalle.tecnicas) {
                for (const tecnica of detalle.tecnicas) {
                    total += parseFloat(tecnica.CostoTecnica || 0);
                }
            }

            // Sumar costos de tallas
            if (detalle.tallas) {
                for (const talla of detalle.tallas) {
                    const precioTalla = parseFloat(talla.talla?.Precio || 0);
                    const cantidad = parseInt(talla.Cantidad || 0);
                    total += precioTalla * cantidad;
                }
            }
        }

        // Actualizar el valor total
        await cotizacion.update({ ValorTotal: total });

        return total;
    } catch (error) {
        console.error('Error calculando valor total:', error);
        return 0;
    }
};



// NUEVA FUNCIÓN: Crear cotización y decidir si va a Ventas o Cotizaciones
exports.createCotizacionInteligente = async (req, res) => {
    try {
        const { DocumentoID, FechaCotizacion, detalles } = req.body;

        // Validar datos
        if (!DocumentoID) {
            return res.status(400).json({ message: 'DocumentoID es obligatorio' });
        }

        // Validar si hay diseños (técnicas)
        const tieneDiseños = detalles && detalles.length > 0 &&
            detalles.some(det => det.tecnicas && det.tecnicas.length > 0);

        if (!tieneDiseños) {
            // NO TIENE DISEÑOS → Crear VENTA PENDIENTE
            const { Venta, DetalleVenta } = require('../models');
            
            let subtotal = 0;
            
            // Calcular subtotal
            for (const detalle of detalles) {
                const producto = await Producto.findByPk(detalle.ProductoID);
                const talla = await Talla.findByPk(detalle.tallas[0]?.TallaID);
                const tela = await Insumo.findByPk(detalle.insumos[0]?.InsumoID);
                
                const precioBase = parseFloat(producto.PrecioBase) || 0;
                const precioTalla = parseFloat(talla?.Precio) || 0;
                const precioTela = parseFloat(tela?.PrecioTela) || 0;
                
                const precioUnitario = precioBase + precioTalla + precioTela;
                subtotal += precioUnitario * detalle.Cantidad;
            }

            // Crear venta con estado "Pendiente" (EstadoID = 8)
            const nuevaVenta = await Venta.create({
                DocumentoID,
                FechaVenta: FechaCotizacion || new Date(),
                Subtotal: subtotal,
                Total: subtotal, // Sin IVA por ahora
                EstadoID: 8 // PENDIENTE
            });

            // Crear detalles de venta
            for (const detalle of detalles) {
                const producto = await Producto.findByPk(detalle.ProductoID);
                const talla = await Talla.findByPk(detalle.tallas[0]?.TallaID);
                const tela = await Insumo.findByPk(detalle.insumos[0]?.InsumoID);
                
                const precioBase = parseFloat(producto.PrecioBase) || 0;
                const precioTalla = parseFloat(talla?.Precio) || 0;
                const precioTela = parseFloat(tela?.PrecioTela) || 0;
                const precioUnitario = precioBase + precioTalla + precioTela;

                await DetalleVenta.create({
                    VentaID: nuevaVenta.VentaID,
                    ProductoID: detalle.ProductoID,
                    ColorID: detalle.colores[0]?.ColorID || null,
                    TallaID: detalle.tallas[0]?.TallaID || null,
                    Cantidad: detalle.Cantidad,
                    PrecioUnitario: precioUnitario
                });
            }

            return res.status(201).json({
                tipo: 'venta',
                message: 'Venta pendiente creada exitosamente',
                venta: nuevaVenta
            });
        }

        // SÍ TIENE DISEÑOS → Crear COTIZACIÓN normal
        const cotizacionData = {
            DocumentoID,
            FechaCotizacion: FechaCotizacion || new Date(),
            ValorTotal: req.body.ValorTotal || 0,
            EstadoID: 1, // Pendiente
            detalles
        };

        // Reutilizar la función existente
        return await exports.createCotizacionCompleta({ body: cotizacionData }, res);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error al procesar la solicitud',
            error: error.message
        });
    }
};





// Exportar la función
exports.calcularValorTotalCotizacion = calcularValorTotalCotizacion;