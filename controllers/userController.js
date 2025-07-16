const userService = require('../services/userService');
const sendResponse = require('../utils/responseHandler');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const offset = (page - 1) * limit;
    
    const users = await userService.getAllUsers(limit, offset, search);
    const totalUsers = await userService.getTotalCount(search);
    
    sendResponse(res, 200, "Users retrieved successfully", {
      users: users,
      totalRecords: totalUsers,
    });
  } catch (err) {
    sendResponse(res, 500, "Error retrieving users", { error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(
      id, 
      req.user.id, 
      req.user.role === 'admin'
    );
    sendResponse(res, 200, "User retrieved successfully", user);
  } catch (err) {
    if (err.message.includes('Forbidden')) {
      return sendResponse(res, 403, err.message, {});
    }
    if (err.message.includes('not found')) {
      return sendResponse(res, 404, err.message, {});
    }
    sendResponse(res, 500, "Error retrieving user", { error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedUser = await userService.updateUser(
      id,
      updateData,
      req.user.id,
      req.user.role === 'admin'
    );
    
    sendResponse(res, 200, "User updated successfully", updatedUser);
  } catch (err) {
    if (err.message.includes('Forbidden')) {
      return sendResponse(res, 403, err.message, {});
    }
    if (err.message.includes('not found')) {
      return sendResponse(res, 404, err.message, {});
    }
    sendResponse(res, 400, "Error updating user", { error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    await userService.deleteUser(
      id,
      req.user.id,
      req.user.role === 'admin'
    );
    
    sendResponse(res, 200, "User deleted successfully", {});
  } catch (err) {
    if (err.message.includes('Forbidden')) {
      return sendResponse(res, 403, err.message, {});
    }
    if (err.message.includes('not found')) {
      return sendResponse(res, 404, err.message, {});
    }
    sendResponse(res, 400, "Error deleting user", { error: err.message });
  }
};
