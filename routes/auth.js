// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
    try {
        // Aceptar tanto mayúsculas como minúsculas
        const Correo = req.body.Correo || req.body.correo;
        const Contraseña = req.body.Contraseña || req.body.contraseña;

        console.log('Login intento:', { Correo, Contraseña: '***' });

        if (!Correo || !Contraseña) {
            return res.status(400).json({ 
                mensaje: 'Correo y contraseña son obligatorios' 
            });
        }

        // Buscar usuario por correo
        const usuario = await db.Usuario.findOne({ 
            where: { Correo: Correo } 
        });

        if (!usuario) {
            console.log('Usuario no encontrado:', Correo);
            return res.status(404).json({ 
                mensaje: 'Usuario no encontrado' 
            });
        }

        console.log('Usuario encontrado:', usuario.Correo);

        // Comparar contraseñas
        const passwordValida = await bcrypt.compare(Contraseña, usuario.Contraseña);
        
        console.log("Contraseña recibida REAL:", req.body.Contraseña);
        console.log("Hash en DB:", usuario.Contraseña);


        if (!passwordValida) {
            console.log('Contraseña incorrecta para:', Correo);
            return res.status(401).json({ 
                mensaje: 'Contraseña incorrecta' 
            });
        }

        // Crear token JWT
        const token = jwt.sign(
            { id: usuario.DocumentoID, rol: usuario.RolID },
            'clave_secreta', // Usa variable de entorno en producción
            { expiresIn: '2h' }
        );

        console.log('Login exitoso:', usuario.Nombre);

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            rol: usuario.RolID,
            nombre: usuario.Nombre
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ 
            mensaje: 'Error interno del servidor', 
            error: error.message 
        });
    }
});

// ==================== REGISTRO ====================
router.post('/registro', async (req, res) => {
    try {
        const { DocumentoID, Nombre, Correo, Telefono, Direccion, Contraseña, RolID } = req.body;

        // Validación de datos obligatorios
        if (!DocumentoID || !Nombre || !Correo || !Contraseña) {
            return res.status(400).json({ 
                mensaje: 'Faltan campos obligatorios' 
            });
        }

        // Verificar si el correo ya existe
        const correoExiste = await db.Usuario.findOne({ 
            where: { Correo } 
        });

        if (correoExiste) {
            return res.status(400).json({ 
                mensaje: 'El correo ya está registrado' 
            });
        }

        // Verificar si el documento ya existe
        const documentoExiste = await db.Usuario.findByPk(DocumentoID);

        if (documentoExiste) {
            return res.status(400).json({ 
                mensaje: 'El documento ya está registrado' 
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(Contraseña, 10);

        // Crear usuario
        const nuevoUsuario = await db.Usuario.create({
            DocumentoID,
            Nombre,
            Correo,
            Telefono: Telefono || '',
            Direccion: Direccion || '',
            Contraseña: hashedPassword,
            RolID: RolID || 2 // Por defecto, rol Cliente
        });

        console.log('Usuario registrado:', nuevoUsuario.Correo);

        // No enviar la contraseña en la respuesta
        const usuarioRespuesta = nuevoUsuario.toJSON();
        delete usuarioRespuesta.Contraseña;

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: usuarioRespuesta
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ 
            mensaje: 'Error al registrar usuario', 
            error: error.message 
        });
    }
});

module.exports = router;