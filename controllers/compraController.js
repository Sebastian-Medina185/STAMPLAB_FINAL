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

        let proveedorRef = null;

        // 1️⃣ Primero validar / buscar proveedor (nuevo sistema con ProveedorRefId)
        if (ProveedorID) {
            const proveedor = await Proveedor.findOne({ where: { Nit: ProveedorID } });
            if (!proveedor) {
                return res.status(404).json({ message: 'Proveedor (Nit) no existe' });
            }
            proveedorRef = proveedor.id;
        }

        if (!proveedorRef) {
            return res.status(400).json({
                message: 'ProveedorRefId o ProveedorID (Nit) requerido'
            });
        }

        // 2️⃣ Crear la compra
        const nuevaCompra = await Compra.create({
            ProveedorRefId: proveedorRef,
            ProveedorID: ProveedorID || null, // legacy opcional
            FechaCompra: new Date(),
            Estado: Estado || 'pendiente'
        });

        // 3️⃣ Crear los detalles
        if (detalles && detalles.length > 0) {
            const detallesConCompraID = detalles.map(detalle => ({
                CompraID: nuevaCompra.CompraID,
                InsumoID: detalle.InsumoID,
                Cantidad: detalle.Cantidad
            }));

            await DetalleCompra.bulkCreate(detallesConCompraID);
        }

        // 4️⃣ Obtener la compra completa
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
        console.error(error);
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