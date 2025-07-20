const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');

// Create order (customers and users)
router.post('/', authMiddleware, orderController.createOrder);

// Get order by ID
router.get('/:id', authMiddleware, orderController.getOrderById);

// Update order status (admin only)
router.put('/:id/status', authMiddleware, authMiddleware.verifyAdmin, orderController.updateOrderStatus);

// Delete order
router.delete('/:id', authMiddleware, orderController.deleteOrder);

// Get all orders (admin only)
router.get('/', authMiddleware, authMiddleware.verifyAdmin, orderController.getAllOrders);

// Get my orders (customers and users)
router.get('/my/orders', authMiddleware, orderController.getMyOrders);

module.exports = router;