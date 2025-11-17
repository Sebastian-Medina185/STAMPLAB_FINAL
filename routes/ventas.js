const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// GET /api/ventas - Obtener todas las ventas
router.get('/', ventaController.getAllVentas);

// GET /api/ventas/:id - Obtener una venta por ID
router.get('/:id', ventaController.getVentaById);

// POST /api/ventas - Crear una nueva venta con detalles
router.post('/', ventaController.createVenta);

// PUT /api/ventas/:id - Actualizar una venta
router.put('/:id', ventaController.updateVenta);

// DELETE /api/ventas/:id - Eliminar una venta
router.delete('/:id', ventaController.deleteVenta);

module.exports = router;