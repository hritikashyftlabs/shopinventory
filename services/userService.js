const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (limit = 10, offset = 0, search = '') => {
  const users = await userModel.getUsers(limit, offset, search);
  // Remove passwords from response
  return users.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
};

exports.getTotalCount = async (search = '') => {
  return await userModel.getTotalCount(search);
};

// Get user by ID
exports.getUserById = async (id, requestingUserId, isAdmin) => {
  // Check authorization
  if (requestingUserId !== parseInt(id) && !isAdmin) {
    throw new Error('Forbidden: You can only access your own profile');
  }
  
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Remove password from response
  const { password, ...safeUser } = user;
  return safeUser;
};

// Update user
exports.updateUser = async (id, updateData, requestingUserId, isAdmin) => {
  // Check authorization
  if (requestingUserId !== parseInt(id) && !isAdmin) {
    throw new Error('Forbidden: You can only update your own profile');
  }
  
  // Check if user exists
  const existingUser = await userModel.getUserById(id);
  if (!existingUser) {
    throw new Error('User not found');
  }
  
  // Prepare update data
  const dataToUpdate = { ...updateData };
  
  // Hash password if provided
  if (dataToUpdate.password) {
    dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
  }
  
  // Handle fullName to full_name conversion
  if (dataToUpdate.fullName) {
    dataToUpdate.full_name = dataToUpdate.fullName;
    delete dataToUpdate.fullName;
  }
  
  // Update user
  const updatedUser = await userModel.updateUser(id, dataToUpdate);
  
  // Remove password from response
  const { password, ...safeUser } = updatedUser;
  return safeUser;
};

// Delete user
exports.deleteUser = async (id, requestingUserId, isAdmin) => {
  // Check authorization
  if (requestingUserId !== parseInt(id) && !isAdmin) {
    throw new Error('Forbidden: You can only delete your own account');
  }
  
  // Check if user exists
  const existingUser = await userModel.getUserById(id);
  if (!existingUser) {
    throw new Error('User not found');
  }
  
  // Delete user
  await userModel.deleteUser(id);
  return { success: true };
};
