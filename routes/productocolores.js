const express = require('express');
const router = express.Router();
const productocolorController = require('../controllers/productocolorController');

// GET /api/productocolores - Obtener todas las relaciones producto-color
router.get('/', productocolorController.getAllProductoColores);

// GET /api/productocolores/:id - Obtener una relación por ID
router.get('/:id', productocolorController.getProductoColorById);

// POST /api/productocolores - Asignar un color a un producto
router.post('/', productocolorController.createProductoColor);

// PUT /api/productocolores/:id - Actualizar estado de producto-color
router.put('/:id', productocolorController.updateProductoColor);

// DELETE /api/productocolores/:id - Eliminar una relación producto-color
router.delete('/:id', productocolorController.deleteProductoColor);

module.exports = router;