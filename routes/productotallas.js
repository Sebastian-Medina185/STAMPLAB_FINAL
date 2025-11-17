const express = require('express');
const router = express.Router();
const productotallaController = require('../controllers/productotallaController');

// GET /api/productotallas - Obtener todas las relaciones producto-talla
router.get('/', productotallaController.getAllProductoTallas);

// GET /api/productotallas/:id - Obtener una relación por ID
router.get('/:id', productotallaController.getProductoTallaById);

// POST /api/productotallas - Asignar una talla a un producto
router.post('/', productotallaController.createProductoTalla);

// PUT /api/productotallas/:id - Actualizar stock y estado
router.put('/:id', productotallaController.updateProductoTalla);

// DELETE /api/productotallas/:id - Eliminar una relación producto-talla
router.delete('/:id', productotallaController.deleteProductoTalla);

module.exports = router;