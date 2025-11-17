const { Compra, Proveedor, DetalleCompra, Insumo } = require('../models');

// Obtener todas las compras
exports.getAllCompras = async (req, res) => {
    try {
        const compras = await Compra.findAll({
            include: [
                {
                    model: Proveedor,
                    as: 'proveedor'
                },
                {
                    model: DetalleCompra,
                    as: 'detalles',
                    include: [
                        {
                            model: Insumo,
                            as: 'insumo'
                        }
                    ]
                }
            ]
        });
        res.json(compras);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener compras',
            error: error.message
        });
    }
};

// Obtener una compra por ID
exports.getCompraById = async (req, res) => {
    try {
        const compra = await Compra.findByPk(req.params.id, {
            include: [
                {
                    model: Proveedor,
                    as: 'proveedor'
                },
                {
                    model: DetalleCompra,
                    as: 'detalles',
                    include: [
                        {
                            model: Insumo,
                            as: 'insumo'
                        }
                    ]
                }
            ]
        });

        if (!compra) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        res.json(compra);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener compra',
            error: error.message
        });
    }
};

// Crear una nueva compra con detalles
exports.createCompra = async (req, res) => {
    try {
        const { ProveedorID, Estado, detalles } = req.body;

        // Crear la compra
        const nuevaCompra = await Compra.create({
            ProveedorID,
            FechaCompra: new Date(),
            Estado: Estado || 'pendiente'
        });

        // Crear los detalles de la compra
        if (detalles && detalles.length > 0) {
            const detallesConCompraID = detalles.map(detalle => ({
                CompraID: nuevaCompra.CompraID,
                InsumoID: detalle.InsumoID,
                Cantidad: detalle.Cantidad
            }));

            await DetalleCompra.bulkCreate(detallesConCompraID);
        }

        // Retornar la compra completa con sus detalles
        const compraCompleta = await Compra.findByPk(nuevaCompra.CompraID, {
            include: [
                {
                    model: Proveedor,
                    as: 'proveedor'
                },
                {
                    model: DetalleCompra,
                    as: 'detalles',
                    include: [
                        {
                            model: Insumo,
                            as: 'insumo'
                        }
                    ]
                }
            ]
        });

        res.status(201).json({
            message: 'Compra creada exitosamente',
            compra: compraCompleta
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear compra',
            error: error.message
        });
    }
};

// Actualizar una compra
exports.updateCompra = async (req, res) => {
    try {
        const { Estado } = req.body;

        const compra = await Compra.findByPk(req.params.id);

        if (!compra) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        await compra.update({
            Estado: Estado || compra.Estado
        });

        res.json({
            message: 'Compra actualizada exitosamente',
            compra
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar compra',
            error: error.message
        });
    }
};

// Eliminar una compra
exports.deleteCompra = async (req, res) => {
    try {
        const compra = await Compra.findByPk(req.params.id);

        if (!compra) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        // Eliminar primero los detalles
        await DetalleCompra.destroy({
            where: { CompraID: req.params.id }
        });

        // Luego eliminar la compra
        await compra.destroy();

        res.json({ message: 'Compra eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar compra',
            error: error.message
        });
    }
};