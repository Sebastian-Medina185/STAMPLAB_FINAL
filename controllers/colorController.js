const db = require('../models');
const Color = db.Color;

// Listar todos los colores
const getAllColores = async (req, res) => {
    try {
        const colores = await Color.findAll();
        res.json({ estado: true, datos: colores });
    } catch (error) {
        console.error(error);
        res.status(500).json({ estado: false, mensaje: "Error al obtener colores" });
    }
};

// Obtener color por ID
const getColorById = async (req, res) => {
    try {
        const color = await Color.findByPk(req.params.id);
        if (!color) return res.status(404).json({ estado: false, mensaje: "Color no encontrado" });
        res.json({ estado: true, datos: color });
    } catch (error) {
        console.error(error);
        res.status(500).json({ estado: false, mensaje: "Error al obtener color" });
    }
};

// Crear color
const createColor = async (req, res) => {
    try {
        const { Nombre } = req.body;
        if (!Nombre) return res.status(400).json({ estado: false, mensaje: "Nombre requerido" });

        const nuevoColor = await Color.create({ Nombre });
        res.json({ estado: true, datos: nuevoColor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ estado: false, mensaje: "Error al crear color" });
    }
};

// Actualizar color
const updateColor = async (req, res) => {
    try {
        const color = await Color.findByPk(req.params.id);
        if (!color) return res.status(404).json({ estado: false, mensaje: "Color no encontrado" });
        color.Nombre = req.body.Nombre;
        await color.save();
        res.json({ estado: true, datos: color });
    } catch (error) {
        console.error(error);
        res.status(500).json({ estado: false, mensaje: "Error al actualizar color" });
    }
};

// Eliminar color
const deleteColor = async (req, res) => {
    try {
        const color = await Color.findByPk(req.params.id);
        if (!color) return res.status(404).json({ estado: false, mensaje: "Color no encontrado" });

        await color.destroy();
        res.json({ estado: true, mensaje: "Color eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ estado: false, mensaje: "Error al eliminar color" });
    }
};

module.exports = { getAllColores, getColorById, createColor, updateColor, deleteColor };
