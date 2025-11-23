const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');

router.get('/', colorController.getAllColores);
router.post('/', colorController.createColor);        // POST crea
router.delete('/:id', colorController.deleteColor);   // DELETE elimina

module.exports = router;
