const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');

// GET /api/colores - Obtener todos los colores
router.get('/', colorController.getAllColores);

// GET /api/colores/:id - Obtener un color por ID
router.get('/:id', colorController.getColorById);

// POST /api/colores - Crear un nuevo color
router.post('/', colorController.createColor);

// PUT /api/colores/:id - Actualizar un color
router.put('/:id', colorController.updateColor);

// DELETE /api/colores/:id - Eliminar un color
router.delete('/:id', colorController.deleteColor);

module.exports = router;