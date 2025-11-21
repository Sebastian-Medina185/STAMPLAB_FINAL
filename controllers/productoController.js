const { Producto, InventarioProducto, Color, Talla, Insumo, ProductoInsumo } = require('../models');



// Obtener todos los productos con sus variantes
exports.getAllProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [
                {
                    model: InventarioProducto,
                    as: 'inventario',
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
                }
            ]
        });
        
        res.json({
            estado: true,
            mensaje: 'Productos obtenidos exitosamente',
            datos: productos
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener productos',
            error: error.message
        });
    }
};

// Obtener un producto por ID con todas sus relaciones
exports.getProductoById = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id, {
            include: [
                {
                    model: InventarioProducto,
                    as: 'inventario',
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
                },
                {
                    model: Insumo,
                    as: 'insumos',
                    through: { 
                        attributes: ['CantidadNecesaria']
                    }
                }
            ]
        });

        if (!producto) {
            return res.status(404).json({ 
                estado: false,
                mensaje: 'Producto no encontrado' 
            });
        }

        res.json({
            estado: true,
            mensaje: 'Producto obtenido exitosamente',
            datos: producto
        });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener producto',
            error: error.message
        });
    }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
    try {
        const { Nombre, Descripcion, ImagenProducto } = req.body;

        const nuevoProducto = await Producto.create({
            Nombre,
            Descripcion,
            ImagenProducto
        });

        res.status(201).json({
            estado: true,
            mensaje: 'Producto creado exitosamente',
            datos: nuevoProducto
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al crear producto',
            error: error.message
        });
    }
};

// Actualizar un producto
exports.updateProducto = async (req, res) => {
    try {
        const { Nombre, Descripcion, ImagenProducto } = req.body;

        const producto = await Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ 
                estado: false,
                mensaje: 'Producto no encontrado' 
            });
        }

        await producto.update({
            Nombre: Nombre || producto.Nombre,
            Descripcion: Descripcion || producto.Descripcion,
            ImagenProducto: ImagenProducto || producto.ImagenProducto
        });

        res.json({
            estado: true,
            mensaje: 'Producto actualizado exitosamente',
            datos: producto
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al actualizar producto',
            error: error.message
        });
    }
};

// Eliminar un producto
exports.deleteProducto = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ 
                estado: false,
                mensaje: 'Producto no encontrado' 
            });
        }

        // Eliminar primero las variantes (inventario)
        await InventarioProducto.destroy({
            where: { ProductoID: req.params.id }
        });

        // Luego eliminar el producto
        await producto.destroy();

        res.json({ 
            estado: true,
            mensaje: 'Producto eliminado exitosamente' 
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al eliminar producto',
            error: error.message
        });
    }
};