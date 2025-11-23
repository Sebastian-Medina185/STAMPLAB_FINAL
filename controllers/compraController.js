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
    const { ProveedorID, ProveedorRefId, EstadoID, detalles } = req.body;

    // ✅ Validar que haya detalles
    if (!detalles || detalles.length === 0) {
      return res.status(400).json({ message: 'Debe agregar al menos un insumo' });
    }

    // ✅ Validar cantidades
    for (const detalle of detalles) {
      if (!detalle.InsumoID || !detalle.Cantidad) {
        return res.status(400).json({ message: 'Cada detalle debe tener InsumoID y Cantidad' });
      }
      if (detalle.Cantidad <= 0) {
        return res.status(400).json({ message: 'Las cantidades deben ser mayores a 0' });
      }
    }

    // ✅ Resolver tanto ProveedorRefId como el Nit (ProveedorID)
    let proveedorRef = ProveedorRefId || null;
    let proveedorNit = ProveedorID || null;

    // Si tenemos ProveedorRefId pero no el Nit, buscarlo
    if (proveedorRef && !proveedorNit) {
      const proveedor = await Proveedor.findByPk(proveedorRef);
      if (!proveedor) {
        return res.status(404).json({ message: 'Proveedor no encontrado' });
      }
      proveedorNit = proveedor.Nit; // ✅ Obtener el Nit del proveedor
    }

    // Si tenemos Nit pero no el ID, buscarlo
    if (!proveedorRef && proveedorNit) {
      const proveedor = await Proveedor.findOne({ where: { Nit: proveedorNit }});
      if (!proveedor) {
        return res.status(404).json({ message: 'Proveedor (Nit) no existe' });
      }
      proveedorRef = proveedor.id;
    }

    // Validar que tengamos ambos
    if (!proveedorRef || !proveedorNit) {
      return res.status(400).json({ message: 'Se requiere un proveedor válido' });
    }

    // ✅ Crear la compra con AMBOS campos
    const nuevaCompra = await Compra.create({
      ProveedorID: proveedorNit,        // ✅ NIT del proveedor (legacy, requerido)
      ProveedorRefId: proveedorRef,     // ✅ ID del proveedor (nuevo)
      FechaCompra: new Date(),
      EstadoID: EstadoID || 'Pendiente'  // ✅ Ahora es string         // Por defecto Pendiente (1)
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

    // Retornar la compra completa con sus detalles y proveedor
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
    console.error("❌ Error al crear compra:", error);
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