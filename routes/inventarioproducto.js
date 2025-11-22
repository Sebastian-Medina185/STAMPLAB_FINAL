const express = require('express');
const router = express.Router();
const inventarioproductoController = require('../controllers/inventarioproductoController');

// GET /api/inventarioproducto - Obtener todo el inventario
router.get('/', inventarioproductoController.getAllInventario);

// GET /api/inventarioproducto/producto/:productoId - Obtener variantes de un producto
router.get('/producto/:productoId', inventarioproductoController.getInventarioByProducto);

// GET /api/inventarioproducto/:id - Obtener una variante por ID
router.get('/:id', inventarioproductoController.getInventarioById);

// POST /api/inventarioproducto - Crear una nueva variante
router.post('/', inventarioproductoController.createInventario);

// PUT /api/inventarioproducto/:id - Actualizar una variante
router.put('/:id', inventarioproductoController.updateInventario);

// DELETE /api/inventarioproducto/:id - Eliminar una variante
router.delete('/:id', inventarioproductoController.deleteInventario);

module.exports = router;