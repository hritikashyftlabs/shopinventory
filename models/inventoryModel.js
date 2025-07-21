const db = require('../config/db');

exports.createItem = async (name, quantity, price = 0) => {
  const result = await db.query(
    'INSERT INTO inventory (name, quantity, price) VALUES ($1, $2, $3) RETURNING *',
    [name, quantity, price]
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

exports.updateItem = async (id, name, quantity, price) => {
  const result = await db.query(
    'UPDATE inventory SET name = $1, quantity = $2, price = $3 WHERE id = $4 RETURNING *',
    [name, quantity, price, id]
  );
  return result.rows[0];
};

exports.deleteItem = async (id) => {
  await db.query('DELETE FROM inventory WHERE id = $1', [id]);
};
