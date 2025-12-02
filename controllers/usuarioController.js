const { Usuario, Rol } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

// ==================== OBTENER TODOS LOS USUARIOS ====================
exports.getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [
                {
                    model: Rol,
                    as: 'rol',
                    attributes: ['RolID', 'Nombre']
                }
            ],
            attributes: { exclude: ['Contraseña'] }
        });

        const usuariosFormateados = usuarios.map(usuario => {
            const usuarioJSON = usuario.toJSON();
            return {
                ...usuarioJSON,
                RolNombre: usuarioJSON.rol ? usuarioJSON.rol.Nombre : null
            };
        });

        res.json(usuariosFormateados);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener usuarios',
            error: error.message
        });
    }
};

// ==================== OBTENER UN USUARIO POR ID ====================
exports.getUsuarioById = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id, {
            include: [
                {
                    model: Rol,
                    as: 'rol',
                    attributes: ['RolID', 'Nombre']
                }
            ],
            attributes: { exclude: ['Contraseña'] }
        });

        if (!usuario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        const usuarioJSON = usuario.toJSON();
        res.json({
            ...usuarioJSON,
            RolNombre: usuarioJSON.rol ? usuarioJSON.rol.Nombre : null
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener usuario',
            error: error.message
        });
    }
};

// ==================== CREAR USUARIO ====================
exports.createUsuario = async (req, res) => {
    try {
        const { DocumentoID, Nombre, Correo, Direccion, Telefono, Contraseña, RolID } = req.body;

        console.log('\n' + '='.repeat(60));
        console.log('CREAR USUARIO - INICIO');
        console.log('='.repeat(60));
        console.log('Body:', JSON.stringify(req.body, null, 2));

        // Validación de datos obligatorios
        if (!DocumentoID || !Nombre || !Correo || !Contraseña || !RolID) {
            return res.status(400).json({
                estado: false,
                mensaje: 'Los campos DocumentoID, Nombre, Correo, Contraseña y RolID son obligatorios'
            });
        }

        // Validacion: Verificar si ya existe un administrador y se intenta crear otro
        if (RolID == 1) { // RolID 1 = Administrador
            const adminExistente = await Usuario.findOne({ where: { RolID: 1 } });
            if (adminExistente) {
                console.log('Ya existe un usuario administrador');
                return res.status(400).json({
                    estado: false,
                    mensaje: 'Ya existe un usuario con rol de Administrador. Solo puede haber uno en el sistema.'
                });
            }
        }

        // Verificar si ya existe un usuario con el mismo correo
        const existeCorreo = await Usuario.findOne({ where: { Correo } });
        if (existeCorreo) {
            return res.status(400).json({
                estado: false,
                mensaje: 'El correo ya está registrado'
            });
        }

        // Verificar si ya existe un usuario con el mismo DocumentoID
        const usuarioExistente = await Usuario.findByPk(DocumentoID);
        if (usuarioExistente) {
            return res.status(400).json({
                estado: false,
                mensaje: 'El documento ya está registrado'
            });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(Contraseña, 10);

        // Preparar todos los datos
        const datosUsuario = {
            DocumentoID,
            Nombre,
            Correo,
            Direccion: Direccion || null,
            Telefono: Telefono || null,
            Contraseña: hashedPassword,
            RolID
        };

        console.log('Guardando usuario...');

        // Crear el usuario
        const nuevoUsuario = await Usuario.create(datosUsuario);

        console.log('Usuario creado exitosamente');
        console.log('='.repeat(60) + '\n');

        // No enviar la contraseña en la respuesta
        const usuarioRespuesta = nuevoUsuario.toJSON();
        delete usuarioRespuesta.Contraseña;

        res.status(201).json({
            estado: true,
            mensaje: 'Usuario creado correctamente',
            datos: usuarioRespuesta
        });

    } catch (error) {
        console.error('Error al crear usuario:', error.message);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al crear usuario',
            error: error.message
        });
    }
};

// ==================== ACTUALIZAR USUARIO ====================
exports.updateUsuario = async (req, res) => {
    try {
        const { Nombre, Correo, Direccion, Telefono, RolID, Contraseña } = req.body;

        console.log('\n' + '='.repeat(60));
        console.log('ACTUALIZAR USUARIO');
        console.log('='.repeat(60));
        console.log('ID:', req.params.id);

        const usuario = await Usuario.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        // Validacion: Si el usuario actual es Admin, no se puede cambiar su rol
        if (usuario.RolID == 1 && RolID && RolID != 1) {
            console.log('❌ Intento de cambiar rol de administrador');
            return res.status(400).json({
                estado: false,
                mensaje: 'No se puede cambiar el rol del Administrador'
            });
        }

        // Validacion: Si se intenta asignar rol Admin a otro usuario
        if (RolID == 1 && usuario.RolID != 1) {
            const adminExistente = await Usuario.findOne({ where: { RolID: 1 } });
            if (adminExistente && adminExistente.DocumentoID != usuario.DocumentoID) {
                console.log('Ya existe otro administrador');
                return res.status(400).json({
                    estado: false,
                    mensaje: 'Ya existe un usuario con rol de Administrador. Solo puede haber uno en el sistema.'
                });
            }
        }

        // Verificar si el correo ya existe en otro usuario
        if (Correo && Correo !== usuario.Correo) {
            const existeCorreo = await Usuario.findOne({ where: { Correo } });
            if (existeCorreo && existeCorreo.DocumentoID !== usuario.DocumentoID) {
                return res.status(400).json({
                    estado: false,
                    mensaje: 'El correo ya está registrado en otro usuario'
                });
            }
        }

        // Preparar datos para actualizar
        const datosActualizar = {
            Nombre: Nombre || usuario.Nombre,
            Correo: Correo || usuario.Correo,
            Direccion: Direccion !== undefined ? Direccion : usuario.Direccion,
            Telefono: Telefono !== undefined ? Telefono : usuario.Telefono,
            RolID: RolID || usuario.RolID
        };

        // Si se envió contraseña nueva, hashearla
        if (Contraseña && Contraseña.trim() !== '') {
            datosActualizar.Contraseña = await bcrypt.hash(Contraseña, 10);
        }

        await usuario.update(datosActualizar);

        // Obtener usuario actualizado con rol
        const usuarioActualizado = await Usuario.findByPk(req.params.id, {
            include: [
                {
                    model: Rol,
                    as: 'rol',
                    attributes: ['RolID', 'Nombre']
                }
            ],
            attributes: { exclude: ['Contraseña'] }
        });

        const usuarioJSON = usuarioActualizado.toJSON();
        const usuarioRespuesta = {
            ...usuarioJSON,
            RolNombre: usuarioJSON.rol ? usuarioJSON.rol.Nombre : null
        };

        console.log('Usuario actualizado');
        console.log('='.repeat(60) + '\n');

        res.json({
            estado: true,
            mensaje: 'Usuario actualizado exitosamente',
            datos: usuarioRespuesta
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al actualizar usuario',
            error: error.message
        });
    }
};

// ==================== ELIMINAR USUARIO ====================
exports.deleteUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        // No se puede eliminar al administrador
        if (usuario.RolID == 1) {
            console.log('Intento de eliminar al administrador');
            return res.status(400).json({
                estado: false,
                mensaje: 'No se puede eliminar al usuario Administrador'
            });
        }

        await usuario.destroy();

        res.json({
            estado: true,
            mensaje: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al eliminar usuario',
            error: error.message
        });
    }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
    try {
        console.log('🔑 Login - req.body:', req.body);

        const Correo = req.body.Correo || req.body.correo;
        const Contraseña = req.body.Contraseña || req.body.contraseña;

        if (!Correo || !Contraseña) {
            return res.status(400).json({
                estado: false,
                mensaje: 'Correo y contraseña son obligatorios'
            });
        }

        const usuario = await db.Usuario.findOne({ where: { Correo } });

        if (!usuario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        const passwordValida = await bcrypt.compare(Contraseña, usuario.Contraseña);
        if (!passwordValida) {
            return res.status(401).json({
                estado: false,
                mensaje: 'Contraseña incorrecta'
            });
        }

        const token = jwt.sign(
            { id: usuario.DocumentoID, rol: usuario.RolID },
            process.env.JWT_SECRET || 'clave_secreta',
            { expiresIn: '2h' }
        );


        res.json({
            estado: true,
            mensaje: 'Inicio de sesión exitoso',
            token,
            rol: usuario.RolID,
            nombre: usuario.Nombre,
            documentoID: usuario.DocumentoID, 
            correo: usuario.Correo               
        });


    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error interno del servidor',
            error: error.message || error
        });
    }
};