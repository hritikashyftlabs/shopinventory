const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply authentication middleware to all user routes
router.use(authMiddleware);

// Get all users (admin only)
router.get('/', authMiddleware.verifyAdmin, userController.getUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', userController.updateUser);

// Delete user (admin or self)
router.delete('/:id', userController.deleteUser);

module.exports = router;
