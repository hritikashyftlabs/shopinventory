const pool = require('../config/db');
const inventoryCache = new Map();

exports.createItem = async (name, quantity) => {
  const result = await pool.query(
    'INSERT INTO inventory (name, quantity) VALUES ($1, $2) RETURNING *',
    [name, quantity]
  );
  return result.rows[0];
};

exports.getItemById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM inventory WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

exports.updateItem = async (id, name, quantity) => {
  const result = await pool.query(
    'UPDATE inventory SET name = $1, quantity = $2 WHERE id = $3 RETURNING *',
    [name, quantity, id]
  );
  return result.rows[0];
};

exports.deleteItem = async (id) => {
  await pool.query('DELETE FROM inventory WHERE id = $1', [id]);
};

module.exports = { inventoryCache, ...exports };