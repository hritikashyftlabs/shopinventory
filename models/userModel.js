const pool = require('../config/db');
const userCache = new Map();

exports.createUser = async (username, password, role) => {
  const result = await pool.query(
    'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
    [username, password, role]
  );
  return result.rows[0];
};

exports.getUserByUsername = async (username) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

module.exports = userCache;