
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/authMiddleware');

const { verifyAdmin } = require('../middlewares/authMiddleware');

// Only admin can add/update/delete, all authenticated users can read
router.post('/', authMiddleware, verifyAdmin, inventoryController.createItem);
router.put('/:id', authMiddleware, verifyAdmin, inventoryController.updateItem);
router.delete('/:id', authMiddleware, verifyAdmin, inventoryController.deleteItem);
router.get('/', authMiddleware, inventoryController.getItems);

module.exports = router;
