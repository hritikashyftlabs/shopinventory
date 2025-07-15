const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { createItemSchema, updateItemSchema, getItemsQuerySchema, getItemByIdSchema } = require('../validations/inventoryValidation');

// Apply authentication middleware to all inventory routes
router.use(authMiddleware);

// Get all items with query validation (accessible by all authenticated users)
router.get('/', validate(getItemsQuerySchema, 'query'), inventoryController.getItems);

// Get single item by ID with param validation (accessible by all authenticated users)
router.get('/:id', validate(getItemByIdSchema, 'params'), inventoryController.getSingleItem);

// Create new item (admin only)
router.post('/', authMiddleware.verifyAdmin, validate(createItemSchema), inventoryController.createItem);

// Update item (admin only)
router.put('/:id', authMiddleware.verifyAdmin, validate(updateItemSchema), validate(getItemByIdSchema, 'params'), inventoryController.updateItem);

// Delete item (admin only)
router.delete('/:id', authMiddleware.verifyAdmin, validate(getItemByIdSchema, 'params'), inventoryController.deleteItem);

module.exports = router;
