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
    const { ProveedorID, ProveedorRefId, Estado, detalles } = req.body;

    // Resolver ProveedorRefId si el cliente envió un Nit (ProveedorID)
    let proveedorRef = ProveedorRefId || null;

    if (!proveedorRef && ProveedorID) {
      // buscar proveedor por Nit
      const proveedor = await Proveedor.findOne({ where: { Nit: ProveedorID }});
      if (!proveedor) {
        return res.status(404).json({ message: 'Proveedor (Nit) no existe' });
      }
      proveedorRef = proveedor.id;
    }

    if (!proveedorRef) {
      return res.status(400).json({ message: 'ProveedorRefId o ProveedorID (Nit) requerido' });
    }

    // Crear la compra
    const nuevaCompra = await Compra.create({
      ProveedorRefId: proveedorRef,
      ProveedorID: ProveedorID || null, // opcionalmente guardar el Nit legacy
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
        const { EstadoID } = req.body;

        const compra = await Compra.findByPk(req.params.id);

        if (!compra) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        // ✅ Usar EstadoID en lugar de Estado
        await compra.update({
            EstadoID: EstadoID || compra.EstadoID
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