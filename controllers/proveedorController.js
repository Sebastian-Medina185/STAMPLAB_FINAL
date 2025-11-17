const { Proveedor, Compra } = require('../models');

// Obtener todos los proveedores
exports.getAllProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.findAll({
            include: [
                {
                    model: Compra,
                    as: 'compras'
                }
            ]
        });
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener proveedores',
            error: error.message
        });
    }
};

// Obtener un proveedor por NIT
exports.getProveedorByNit = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByPk(req.params.nit, {
            include: [
                {
                    model: Compra,
                    as: 'compras'
                }
            ]
        });

        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        res.json(proveedor);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener proveedor',
            error: error.message
        });
    }
};

// Crear un nuevo proveedor
exports.createProveedor = async (req, res) => {
    try {
        const { Nit, Nombre, Correo, Telefono, Direccion, Estado } = req.body;

        const nuevoProveedor = await Proveedor.create({
            Nit,
            Nombre,
            Correo,
            Telefono,
            Direccion,
            Estado: Estado !== undefined ? Estado : true
        });

        res.status(201).json({
            message: 'Proveedor creado exitosamente',
            proveedor: nuevoProveedor
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear proveedor',
            error: error.message
        });
    }
};

// Actualizar un proveedor
exports.updateProveedor = async (req, res) => {
    try {
        const { Nombre, Correo, Telefono, Direccion, Estado } = req.body;

        const proveedor = await Proveedor.findByPk(req.params.nit);

        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        await proveedor.update({
            Nombre: Nombre || proveedor.Nombre,
            Correo: Correo || proveedor.Correo,
            Telefono: Telefono || proveedor.Telefono,
            Direccion: Direccion || proveedor.Direccion,
            Estado: Estado !== undefined ? Estado : proveedor.Estado
        });

        res.json({
            message: 'Proveedor actualizado exitosamente',
            proveedor
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar proveedor',
            error: error.message
        });
    }
};

// Eliminar un proveedor
exports.deleteProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByPk(req.params.nit);

        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        await proveedor.destroy();

        res.json({ message: 'Proveedor eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar proveedor',
            error: error.message
        });
    }
};