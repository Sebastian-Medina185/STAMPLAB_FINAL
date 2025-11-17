const { Insumo, Producto } = require('../models');

// Obtener todos los insumos
exports.getAllInsumos = async (req, res) => {
    try {
        const insumos = await Insumo.findAll();
        res.json(insumos);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener insumos',
            error: error.message
        });
    }
};

// Obtener un insumo por ID
exports.getInsumoById = async (req, res) => {
    try {
        const insumo = await Insumo.findByPk(req.params.id, {
            include: [
                {
                    model: Producto,
                    as: 'productos',
                    through: { attributes: [] }
                }
            ]
        });

        if (!insumo) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        res.json(insumo);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener insumo',
            error: error.message
        });
    }
};

// Crear un nuevo insumo
exports.createInsumo = async (req, res) => {
    try {
        const { Nombre, Stock, Estado } = req.body;

        const nuevoInsumo = await Insumo.create({
            Nombre,
            Stock: Stock || 0,
            Estado: Estado !== undefined ? Estado : true
        });

        res.status(201).json({
            message: 'Insumo creado exitosamente',
            insumo: nuevoInsumo
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear insumo',
            error: error.message
        });
    }
};

// Actualizar un insumo
exports.updateInsumo = async (req, res) => {
    try {
        const { Nombre, Stock, Estado } = req.body;

        const insumo = await Insumo.findByPk(req.params.id);

        if (!insumo) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        await insumo.update({
            Nombre: Nombre || insumo.Nombre,
            Stock: Stock !== undefined ? Stock : insumo.Stock,
            Estado: Estado !== undefined ? Estado : insumo.Estado
        });

        res.json({
            message: 'Insumo actualizado exitosamente',
            insumo
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar insumo',
            error: error.message
        });
    }
};

// Eliminar un insumo
exports.deleteInsumo = async (req, res) => {
    try {
        const insumo = await Insumo.findByPk(req.params.id);

        if (!insumo) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        await insumo.destroy();

        res.json({ message: 'Insumo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar insumo',
            error: error.message
        });
    }
};