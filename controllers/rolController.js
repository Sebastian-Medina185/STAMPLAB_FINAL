const { Rol, Usuario, Permiso } = require('../models');

// Obtener todos los roles
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'usuarios'
                },
                {
                    model: Permiso,
                    as: 'permisos',
                    through: { attributes: [] }
                }
            ]
        });
        res.json(roles);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener roles',
            error: error.message
        });
    }
};

// Obtener un rol por ID
exports.getRolById = async (req, res) => {
    try {
        const rol = await Rol.findByPk(req.params.id, {
            include: [
                {
                    model: Usuario,
                    as: 'usuarios'
                },
                {
                    model: Permiso,
                    as: 'permisos',
                    through: { attributes: [] }
                }
            ]
        });

        if (!rol) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        res.json(rol);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener rol',
            error: error.message
        });
    }
};

// Crear un nuevo rol
exports.createRol = async (req, res) => {
    try {
        const { Nombre, Descripcion, Estado } = req.body;

        const nuevoRol = await Rol.create({
            Nombre,
            Descripcion,
            Estado: Estado !== undefined ? Estado : true
        });

        res.status(201).json({
            message: 'Rol creado exitosamente',
            rol: nuevoRol
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear rol',
            error: error.message
        });
    }
};

// Actualizar un rol
exports.updateRol = async (req, res) => {
    try {
        const { Nombre, Descripcion, Estado } = req.body;

        const rol = await Rol.findByPk(req.params.id);

        if (!rol) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        await rol.update({
            Nombre: Nombre || rol.Nombre,
            Descripcion: Descripcion || rol.Descripcion,
            Estado: Estado !== undefined ? Estado : rol.Estado
        });

        res.json({
            message: 'Rol actualizado exitosamente',
            rol
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar rol',
            error: error.message
        });
    }
};

// Eliminar un rol
exports.deleteRol = async (req, res) => {
    try {
        const rol = await Rol.findByPk(req.params.id);

        if (!rol) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        await rol.destroy();

        res.json({ message: 'Rol eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar rol',
            error: error.message
        });
    }
};

// Asignar permisos a un rol
exports.asignarPermisos = async (req, res) => {
    try {
        const { permisosIds } = req.body;
        const rol = await Rol.findByPk(req.params.id);

        if (!rol) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        const permisos = await Permiso.findAll({
            where: { PermisoID: permisosIds }
        });

        await rol.setPermisos(permisos);

        res.json({
            message: 'Permisos asignados exitosamente',
            rol: await Rol.findByPk(req.params.id, {
                include: [{ model: Permiso, as: 'permisos' }]
            })
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al asignar permisos',
            error: error.message
        });
    }
};