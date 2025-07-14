const db = require('../config/db');

/**
 * Create a new user
 * @param {string} username - User's username
 * @param {string} password - Hashed password
 * @param {string} role - User's role (admin, user, etc.)
 * @returns {Promise<Object>} Created user object
 */
exports.createUser = async (username, password, role, email = null, full_name = null) => {
  try {
    const query = `
      INSERT INTO users (username, password, role, email, full_name) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const result = await db.query(query, [username, password, role, email, full_name]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Username already exists');
    }
    throw error;
  }
};

/**
 * Get user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
exports.getUserByUsername = async (username) => {
  const result = await db.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
exports.getUserById = async (id) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

/**
 * Get all users
 * @returns {Promise<Array>} Array of user objects
 */
exports.getUsers = async () => {
  const result = await db.query('SELECT * FROM users ORDER BY id');
  return result.rows;
};

/**
 * Update user
 * @param {number} id - User ID
 * @param {Object} updateData - Object containing fields to update
 * @returns {Promise<Object>} Updated user object
 */
exports.updateUser = async (id, updateData) => {
  try {
    // Build dynamic query based on provided fields
    const fields = Object.keys(updateData);
    if (fields.length === 0) {
      throw new Error('No update data provided');
    }
    
    const values = Object.values(updateData);
    
    // Create placeholders for query ($1, $2, etc.)
    const placeholders = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    // Add id as the last parameter
    values.push(id);
    
    const query = `
      UPDATE users 
      SET ${placeholders} 
      WHERE id = $${values.length} 
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Username already exists');
    }
    throw error;
  }
};

/**
 * Delete user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} True if user was deleted
 */
exports.deleteUser = async (id) => {
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return true;
};

// Export all functions
module.exports = exports;
