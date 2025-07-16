const db = require('../config/db');

exports.createItem = async (name, quantity) => {
  const result = await db.query(
    'INSERT INTO inventory (name, quantity) VALUES ($1, $2) RETURNING *',
    [name, quantity]
  );
  return result.rows[0];
};

exports.getItemById = async (id) => {
  const result = await db.query(
    'SELECT * FROM inventory WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

exports.getItems = async ()=>{
  const result = await db.query(
    'SELECT * FROM inventory'
  );
  return result.rows;
}

exports.updateItem = async (id, name, quantity) => {
  const result = await db.query(
    'UPDATE inventory SET name = $1, quantity = $2 WHERE id = $3 RETURNING *',
    [name, quantity, id]
  );
  return result.rows[0];
};

exports.deleteItem = async (id) => {
  await db.query('DELETE FROM inventory WHERE id = $1', [id]);
};