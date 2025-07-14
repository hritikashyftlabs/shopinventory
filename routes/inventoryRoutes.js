const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { verifyAdmin } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all inventory routes
router.use(authMiddleware);

// Get all items
router.get('/', inventoryController.getItems);

// Create new item
router.post('/', inventoryController.createItem);

// Get single item by ID
router.get('/:id', inventoryController.getSingleItem);

// Update item
router.put('/:id', inventoryController.updateItem);

// Delete item
router.delete('/:id', inventoryController.deleteItem);

module.exports = router;
