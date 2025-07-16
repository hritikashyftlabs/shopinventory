const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Get all users (admin only)
router.get('/', authMiddleware, authMiddleware.verifyAdmin, userController.getUsers);

// Get user by ID
router.get('/:id', authMiddleware, userController.getUserById);

// Update user
router.put('/:id', authMiddleware, userController.updateUser);

// Delete user (admin or self)
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;