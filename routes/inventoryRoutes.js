const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');


router.post('/', inventoryController.createItem);
router.get('/:id', inventoryController.getSingleItem); // corrected function name
router.put('/:id', inventoryController.updateItem);
router.delete('/:id', inventoryController.deleteItem);

module.exports = router;