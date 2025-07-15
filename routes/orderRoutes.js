const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { createOrderSchema, updateOrderStatusSchema, getOrdersQuerySchema, orderIdSchema } = require('../validations/orderValidation');

// Apply authentication middleware to all order routes
router.use(authMiddleware);

// Create new order
router.post('/', validate(createOrderSchema), orderController.createOrder);

// Get customer's own orders
router.get('/my-orders', validate(getOrdersQuerySchema, 'query'), orderController.getMyOrders);

// Get all orders (admin only)
router.get('/', authMiddleware.verifyAdmin, validate(getOrdersQuerySchema, 'query'), orderController.getAllOrders);

// Get single order by ID
router.get('/:id', validate(orderIdSchema, 'params'), orderController.getOrderById);

// Update order status (admin only)
router.put('/:id/status', authMiddleware.verifyAdmin, validate(orderIdSchema, 'params'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

// Delete order
router.delete('/:id', validate(orderIdSchema, 'params'), orderController.deleteOrder);

module.exports = router;
