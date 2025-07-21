const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Get user profile
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Get all users (admin only)
router.get('/', authMiddleware, authMiddleware.verifyAdmin, userController.getUsers);

// Get user by ID
router.get('/:id', authMiddleware, userController.getUserById);

// Update user
router.put('/:id', authMiddleware, userController.updateUser);

// Delete user
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
