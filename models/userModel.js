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
    'SELECT id, username, role, email, full_name, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

exports.getUsers = async () => {
  const result = await db.query(
    'SELECT id, username, role, email, full_name, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

exports.updateUser = async (id, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach(key => {
    fields.push(`${key} = $${paramCount}`);
    values.push(updates[key]);
    paramCount++;
  });

  values.push(id);
  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
  
  const result = await db.query(query, values);
  return result.rows[0];
};

exports.deleteUser = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
  return true;
};
