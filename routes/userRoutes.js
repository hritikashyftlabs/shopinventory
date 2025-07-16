const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { updateUserSchema, getUsersQuerySchema } = require('../validations/userValidation');

// Apply authentication middleware to all user routes
router.use(authMiddleware);

// Get all users (admin only)
router.get('/', authMiddleware.verifyAdmin, validate(getUsersQuerySchema, 'query'), userController.getUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user (PUT method)
router.put('/:id', validate(updateUserSchema), userController.updateUser);

// Delete user (admin or self)
router.delete('/:id', userController.deleteUser);

module.exports = router;
