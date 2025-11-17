const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estadoController');

// GET /api/estados - Obtener todos los estados
router.get('/', estadoController.getAllEstados);

// GET /api/estados/:id - Obtener un estado por ID
router.get('/:id', estadoController.getEstadoById);


//FALTA EL CONTROLADOR DE CREAR Y ACTUALIZAR EN ESTADOS

// // POST /api/estados - Crear un nuevo estado
// router.post('/', estadoController.createEstado);

// // PUT /api/estados/:id - Actualizar un estado
// router.put('/:id', estadoController.updateEstado);



// DELETE /api/estados/:id - Eliminar un estado
router.delete('/:id', estadoController.deleteEstado);

module.exports = router;