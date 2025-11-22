// routes/cotizaciones.js
const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');

// GET /api/cotizaciones - Obtener todas las cotizaciones
router.get('/', cotizacionController.getAllCotizaciones);

// GET /api/cotizaciones/:id - Obtener una cotización por ID
router.get('/:id', cotizacionController.getCotizacionById);

// POST /api/cotizaciones - Crear una nueva cotización (solo cabecera)
router.post('/', cotizacionController.createCotizacion);

// POST /api/cotizaciones/completa - Crear cotización completa con detalles
router.post('/completa', cotizacionController.createCotizacionCompleta);

// PUT /api/cotizaciones/:id - Actualizar una cotización
router.put('/:id', cotizacionController.updateCotizacion);

// DELETE /api/cotizaciones/:id - Eliminar una cotización
router.delete('/:id', cotizacionController.deleteCotizacion);

module.exports = router;