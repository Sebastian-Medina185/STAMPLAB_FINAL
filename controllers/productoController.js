const { Producto, Color, Talla, Insumo, ProductoColor, ProductoTalla, ProductoInsumo } = require('../models');

// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [
                {
                    model: Color,
                    as: 'colores',
                    through: {
                        model: ProductoColor,
                        attributes: ['Estado']
                    }
                },
                {
                    model: Talla,
                    as: 'tallas',
                    through: {
                        model: ProductoTalla,
                        attributes: ['StockDisponible', 'Estado']
                    }
                },
                {
                    model: Insumo,
                    as: 'insumos',
                    through: { attributes: [] }
                }
            ]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener productos',
            error: error.message
        });
    }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id, {
            include: [
                {
                    model: Color,
                    as: 'colores',
                    through: {
                        model: ProductoColor,
                        attributes: ['Estado']
                    }
                },
                {
                    model: Talla,
                    as: 'tallas',
                    through: {
                        model: ProductoTalla,
                        attributes: ['StockDisponible', 'Estado']
                    }
                },
                {
                    model: Insumo,
                    as: 'insumos',
                    through: { attributes: [] }
                }
            ]
        });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener producto',
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
            message: 'Producto creado exitosamente',
            producto: nuevoProducto
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear producto',
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
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await producto.update({
            Nombre: Nombre || producto.Nombre,
            Descripcion: Descripcion || producto.Descripcion,
            ImagenProducto: ImagenProducto || producto.ImagenProducto
        });

        res.json({
            message: 'Producto actualizado exitosamente',
            producto
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar producto',
            error: error.message
        });
    }
};

// Eliminar un producto
exports.deleteProducto = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await producto.destroy();

        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar producto',
            error: error.message
        });
    }
};

// Asignar colores a un producto
exports.asignarColores = async (req, res) => {
    try {
        const { coloresIds } = req.body;
        const producto = await Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const colores = await Color.findAll({
            where: { ColorID: coloresIds }
        });

        await producto.setColores(colores);

        res.json({
            message: 'Colores asignados exitosamente',
            producto: await Producto.findByPk(req.params.id, {
                include: [{ model: Color, as: 'colores' }]
            })
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al asignar colores',
            error: error.message
        });
    }
};

// Asignar tallas a un producto
exports.asignarTallas = async (req, res) => {
    try {
        const { tallasIds } = req.body;
        const producto = await Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const tallas = await Talla.findAll({
            where: { TallaID: tallasIds }
        });

        await producto.setTallas(tallas);

        res.json({
            message: 'Tallas asignadas exitosamente',
            producto: await Producto.findByPk(req.params.id, {
                include: [{ model: Talla, as: 'tallas' }]
            })
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al asignar tallas',
            error: error.message
        });
    }
};