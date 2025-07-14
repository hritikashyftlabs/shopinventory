const db = require('../config/db');

exports.createItem = async (name, quantity) => {
  const result = await db.query(
    'INSERT INTO inventory (name, quantity) VALUES ($1, $2) RETURNING id',
    [name, quantity]
  );
  return { message: 'Item added', id: result.rows[0].id };
};

exports.getItems = async () => {
  const result = await db.query('SELECT * FROM inventory');
  return result.rows;
};

exports.updateItem = async (id, name, quantity) => {
  const result = await db.query(
    'UPDATE inventory SET name = $1, quantity = $2 WHERE id = $3 RETURNING *',
    [name, quantity, id]
  );
  
  if (result.rowCount === 0) {
    throw new Error('Item not found');
  }
  
  return { message: 'Item updated' };
};

exports.deleteItem = async (id) => {
  const result = await db.query('DELETE FROM inventory WHERE id = $1', [id]);
  
  if (result.rowCount === 0) {
    throw new Error('Item not found');
  }
  
  return { message: 'Item deleted' };
};
