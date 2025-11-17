const express = require('express');
const router = express.Router();
const productoinsumoController = require('../controllers/productoinsumoController');

// GET /api/productoinsumos - Obtener todas las relaciones producto-insumo
router.get('/', productoinsumoController.getAllProductoInsumos);

// GET /api/productoinsumos/:id - Obtener una relación por ID
router.get('/:id', productoinsumoController.getProductoInsumoById);

// POST /api/productoinsumos - Asignar un insumo a un producto
router.post('/', productoinsumoController.createProductoInsumo);

// DELETE /api/productoinsumos/:id - Eliminar una relación producto-insumo
router.delete('/:id', productoinsumoController.deleteProductoInsumo);

module.exports = router;