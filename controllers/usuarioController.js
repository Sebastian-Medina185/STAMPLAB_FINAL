const { Usuario, Rol } = require('../models');

const bcrypt = require('bcryptjs');
const db = require('../models');

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [
                {
                    model: Rol,
                    as: 'rol'
                }
            ],
            attributes: { exclude: ['Contraseña'] }
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
};

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id, {
            include: [
                {
                    model: Rol,
                    as: 'rol'
                }
            ],
            attributes: { exclude: ['Contraseña'] }
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener usuario',
            error: error.message
        });
    }
};

// Crear un nuevo usuario (con validación y hash de contraseña)
exports.createUsuario = async (req, res) => {
    try {
        const { DocumentoID, Nombre, Correo, Direccion, Telefono, Contraseña, RolID } = req.body;

        // Validación de datos obligatorios
        if (!DocumentoID || !Nombre || !Correo || !Contraseña || !RolID) {
            return res.status(400).json({ 
                estado: false,
                mensaje: 'Todos los campos son obligatorios' 
            });
        }

        // Verificar si ya existe un usuario con el mismo correo
        const existe = await Usuario.findOne({ where: { Correo } });
        if (existe) {
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

        // Encriptar la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(Contraseña, 10);

        // Crear el usuario
        const nuevoUsuario = await Usuario.create({
            DocumentoID,
            Nombre,
            Correo,
            Direccion,
            Telefono,
            Contraseña: hashedPassword,
            RolID
        });

        // No enviar la contraseña en la respuesta
        const usuarioRespuesta = nuevoUsuario.toJSON();
        delete usuarioRespuesta.Contraseña;

        res.status(201).json({
            estado: true,
            mensaje: 'Usuario creado correctamente',
            usuario: usuarioRespuesta
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al crear usuario',
            error: error.message
        });
    }
};

// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
    try {
        const { Nombre, Correo, Direccion, Telefono, RolID, Contraseña } = req.body;

        const usuario = await Usuario.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).json({ 
                estado: false,
                mensaje: 'Usuario no encontrado' 
            });
        }

        // Preparar datos para actualizar
        const datosActualizar = {
            Nombre: Nombre || usuario.Nombre,
            Correo: Correo || usuario.Correo,
            Direccion: Direccion || usuario.Direccion,
            Telefono: Telefono || usuario.Telefono,
            RolID: RolID || usuario.RolID
        };

        // Si se envió una nueva contraseña, hashearla
        if (Contraseña && Contraseña.trim() !== '') {
            datosActualizar.Contraseña = await bcrypt.hash(Contraseña, 10);
        }

        await usuario.update(datosActualizar);

        const usuarioRespuesta = usuario.toJSON();
        delete usuarioRespuesta.Contraseña;

        res.json({
            estado: true,
            mensaje: 'Usuario actualizado exitosamente',
            usuario: usuarioRespuesta
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

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).json({ 
                estado: false,
                mensaje: 'Usuario no encontrado' 
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

// ================================================= //


// ==================== REGISTRO USUARIO ====================
exports.createUsuario = async (req, res) => {
    try {
        const { DocumentoID, Nombre, Correo, Contraseña, RolID } = req.body;

        // Validación de datos obligatorios
        if (!DocumentoID || !Nombre || !Correo || !Contraseña || !RolID) {
            return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        }

        // Verificar si ya existe un usuario con el mismo correo
        const existe = await db.Usuario.findOne({ where: { Correo } });
        if (existe) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(Contraseña, 10);

        // Crear el usuario
        const nuevoUsuario = await db.Usuario.create({
            DocumentoID,
            Nombre,
            Correo,
            Contraseña: hashedPassword,
            RolID
        });

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            usuario: nuevoUsuario
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            mensaje: 'Error al crear usuario',
            error: error
        });
    }
};


// ==================== LOGIN ====================
exports.login = async (req, res) => {
    try {
        // Mostrar lo que llega para depurar
        console.log('Login - req.body:', req.body);

        // Aceptar tanto "Correo" como "correo" (y "Contraseña"/"contraseña")
        const Correo = req.body.Correo || req.body.correo;
        const Contraseña = req.body.Contraseña || req.body.contraseña;

        if (!Correo || !Contraseña) {
            return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
        }

        // Buscar usuario por la columna 'Correo' en la BD
        const usuario = await db.Usuario.findOne({ where: { Correo } });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Comparar contraseñas con bcrypt
        const passwordValida = await bcrypt.compare(Contraseña, usuario.Contraseña);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        // Crear token JWT
        const token = jwt.sign(
            { id: usuario.DocumentoID, rol: usuario.RolID },
            'clave_secreta', // Usa variable de entorno en producción
            { expiresIn: '2h' }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            rol: usuario.RolID,
            nombre: usuario.Nombre
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message || error });
    }
};
