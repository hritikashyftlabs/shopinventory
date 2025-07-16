const db = require('../config/db');

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
    if (error.code === '23505') { 
      throw new Error('Username already exists');
    }
    throw error;
  }
};


exports.getUserByUsername = async (username) => {
  const result = await db.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};


exports.getUserById = async (id) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};


exports.getUsers = async (limit = 10, offset = 0, search = '') => {
  let query = 'SELECT * FROM users';
  const params = [];
  
  if (search) {
    query += ' WHERE username ILIKE $1 OR full_name ILIKE $1 OR email ILIKE $1';
    params.push(`%${search}%`);
  }
  
  query += ' ORDER BY id LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limit, offset);
  
  const result = await db.query(query, params);
  return result.rows;
};

exports.getTotalCount = async (search = '') => {
  let query = 'SELECT COUNT(*) FROM users';
  const params = [];
  
  if (search) {
    query += ' WHERE username ILIKE $1 OR full_name ILIKE $1 OR email ILIKE $1';
    params.push(`%${search}%`);
  }
  
  const result = await db.query(query, params);
  return parseInt(result.rows[0].count);
};

exports.updateUser = async (id, updateData) => {
  try {
    const fields = Object.keys(updateData);
    if (fields.length === 0) {
      throw new Error('No update data provided');
    }
    
    const values = Object.values(updateData);
    
    const placeholders = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
  
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


exports.deleteUser = async (id) => {
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return true;
};


module.exports = exports;
