const express = require('express');
const router = express.Router();
const tecnicaController = require('../controllers/tecnicaController');

// GET /api/tecnicas - Obtener todas las técnicas
router.get('/', tecnicaController.getAllTecnicas);

// GET /api/tecnicas/:id - Obtener una técnica por ID
router.get('/:id', tecnicaController.getTecnicaById);

// POST /api/tecnicas - Crear una nueva técnica
router.post('/', tecnicaController.createTecnica);

// PUT /api/tecnicas/:id - Actualizar una técnica
router.put('/:id', tecnicaController.updateTecnica);

// DELETE /api/tecnicas/:id - Eliminar una técnica
router.delete('/:id', tecnicaController.deleteTecnica);

module.exports = router;