const { InventarioProducto, Producto, Color, Talla } = require('../models');

// Obtener todas las variantes (inventario)
exports.getAllInventario = async (req, res) => {
    try {
        const inventario = await InventarioProducto.findAll({
            include: [
                {
                    model: Producto,
                    as: 'producto',
                    attributes: ['ProductoID', 'Nombre', 'Descripcion']
                },
                {
                    model: Color,
                    as: 'color',
                    attributes: ['ColorID', 'Nombre']
                },
                {
                    model: Talla,
                    as: 'talla',
                    attributes: ['TallaID', 'Nombre']
                }
            ]
        });

        res.json({
            estado: true,
            mensaje: 'Inventario obtenido exitosamente',
            datos: inventario
        });
    } catch (error) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener inventario',
            error: error.message
        });
    }
};

// Obtener variantes de un producto específico
exports.getInventarioByProducto = async (req, res) => {
    try {
        const { productoId } = req.params;

        const inventario = await InventarioProducto.findAll({
            where: { ProductoID: productoId },
            include: [
                {
                    model: Color,
                    as: 'color',
                    attributes: ['ColorID', 'Nombre']
                },
                {
                    model: Talla,
                    as: 'talla',
                    attributes: ['TallaID', 'Nombre']
                }
            ]
        });

        res.json({
            estado: true,
            mensaje: 'Variantes obtenidas exitosamente',
            datos: inventario
        });
    } catch (error) {
        console.error('Error al obtener variantes:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener variantes',
            error: error.message
        });
    }
};

// Obtener una variante por ID
exports.getInventarioById = async (req, res) => {
    try {
        const inventario = await InventarioProducto.findByPk(req.params.id, {
            include: [
                { model: Producto, as: 'producto' },
                { model: Color, as: 'color' },
                { model: Talla, as: 'talla' }
            ]
        });

        if (!inventario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Variante no encontrada'
            });
        }

        res.json({
            estado: true,
            mensaje: 'Variante obtenida exitosamente',
            datos: inventario
        });
    } catch (error) {
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener variante',
            error: error.message
        });
    }
};

// Crear una nueva variante
exports.createInventario = async (req, res) => {
    try {
        const { ProductoID, ColorID, TallaID, Stock, Estado } = req.body;

        // Validar que no exista ya esa combinación
        const existe = await InventarioProducto.findOne({
            where: {
                ProductoID,
                ColorID,
                TallaID
            }
        });

        if (existe) {
            return res.status(400).json({
                estado: false,
                mensaje: 'Ya existe una variante con esa combinación de color y talla'
            });
        }

        const nuevoInventario = await InventarioProducto.create({
            ProductoID,
            ColorID,
            TallaID,
            Stock: Stock || 0,
            Estado: Estado !== undefined ? Estado : 1
        });

        res.status(201).json({
            estado: true,
            mensaje: 'Variante creada exitosamente',
            datos: nuevoInventario
        });
    } catch (error) {
        console.error('Error al crear variante:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al crear variante',
            error: error.message
        });
    }
};

// Actualizar una variante
exports.updateInventario = async (req, res) => {
    try {
        const { Stock, Estado } = req.body;

        const inventario = await InventarioProducto.findByPk(req.params.id);

        if (!inventario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Variante no encontrada'
            });
        }

        await inventario.update({
            Stock: Stock !== undefined ? Stock : inventario.Stock,
            Estado: Estado !== undefined ? Estado : inventario.Estado
        });

        res.json({
            estado: true,
            mensaje: 'Variante actualizada exitosamente',
            datos: inventario
        });
    } catch (error) {
        res.status(500).json({
            estado: false,
            mensaje: 'Error al actualizar variante',
            error: error.message
        });
    }
};

// Eliminar una variante
exports.deleteInventario = async (req, res) => {
    try {
        const inventario = await InventarioProducto.findByPk(req.params.id);

        if (!inventario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Variante no encontrada'
            });
        }

        await inventario.destroy();

        res.json({
            estado: true,
            mensaje: 'Variante eliminada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            estado: false,
            mensaje: 'Error al eliminar variante',
            error: error.message
        });
    }
};