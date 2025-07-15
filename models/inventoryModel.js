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

exports.getItems = async (limit = 10, offset = 0, search = '') => {
  let query = 'SELECT * FROM inventory';
  const params = [];
  
  if (search) {
    query += ' WHERE name ILIKE $1';
    params.push(`%${search}%`);
  }
  
  query += ' ORDER BY id';
  
  // Add LIMIT and OFFSET
  if (params.length > 0) {
    query += ' LIMIT $2 OFFSET $3';
    params.push(limit, offset);
  } else {
    query += ' LIMIT $1 OFFSET $2';
    params.push(limit, offset);
  }
  
  console.log('Query:', query);
  console.log('Params:', params);
  
  const result = await db.query(query, params);
  return result.rows;
};

exports.getTotalCount = async (search = '') => {
  let query = 'SELECT COUNT(*) FROM inventory';
  const params = [];
  
  if (search) {
    query += ' WHERE name ILIKE $1';
    params.push(`%${search}%`);
  }
  
  const result = await db.query(query, params);
  return parseInt(result.rows[0].count);
};

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
