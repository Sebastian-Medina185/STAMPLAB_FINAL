const { Tecnica } = require('../models');

exports.getAllTecnicas = async (req, res) => {
    try {
        const tecnicas = await Tecnica.findAll();
        res.json(tecnicas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener técnicas', error: error.message });
    }
};

exports.getTecnicaById = async (req, res) => {
    try {
        const tecnica = await Tecnica.findByPk(req.params.id);
        if (!tecnica) return res.status(404).json({ message: 'Técnica no encontrada' });
        res.json(tecnica);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener técnica', error: error.message });
    }
};

exports.createTecnica = async (req, res) => {
    try {
        // Extraemos los campos exactos que tu modelo espera
        const { Nombre, Descripcion, ImagenTecnica, Estado } = req.body;

        if (!Nombre) return res.status(400).json({ message: 'El nombre es obligatorio' });

        const nuevaTecnica = await Tecnica.create({
            Nombre,
            Descripcion: Descripcion || "",
            ImagenTecnica: ImagenTecnica || "",
            Estado: Estado !== undefined ? Estado : true
        });

        res.json({ estado: true, tecnica: nuevaTecnica });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear técnica', error: error.message });
    }
};

exports.updateTecnica = async (req, res) => {
    try {
        const tecnica = await Tecnica.findByPk(req.params.id);
        if (!tecnica) return res.status(404).json({ message: 'Técnica no encontrada' });

        const { Nombre, Descripcion, ImagenTecnica, Estado } = req.body;

        await tecnica.update({
            Nombre: Nombre || tecnica.Nombre,
            Descripcion: Descripcion !== undefined ? Descripcion : tecnica.Descripcion,
            ImagenTecnica: ImagenTecnica !== undefined ? ImagenTecnica : tecnica.ImagenTecnica,
            Estado: Estado !== undefined ? Estado : tecnica.Estado
        });

        res.json({ estado: true, tecnica });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar técnica', error: error.message });
    }
};

exports.deleteTecnica = async (req, res) => {
    try {
        const tecnica = await Tecnica.findByPk(req.params.id);
        if (!tecnica) return res.status(404).json({ message: 'Técnica no encontrada' });

        await tecnica.destroy();
        res.json({ estado: true });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar técnica', error: error.message });
    }
};
