const db = require('../config/db');

exports.createOrder = async (userId, items, totalAmount, status = 'pending') => {
  const client = await db.getPool().connect();
  try {
    await client.query('BEGIN');
    
    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, totalAmount, status]
    );
    const order = orderResult.rows[0];
    
    // Create order items
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, inventory_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.inventory_id, item.quantity, item.price]
      );
      
      // Update inventory quantity - THIS REDUCES STOCK
      await client.query(
        'UPDATE inventory SET quantity = quantity - $1 WHERE id = $2',
        [item.quantity, item.inventory_id]
      );
    }
    
    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

exports.getOrderById = async (id) => {
  const result = await db.query(`
    SELECT o.*, u.username, u.full_name,
           json_agg(
             json_build_object(
               'id', oi.id,
               'inventory_id', oi.inventory_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'item_name', i.name
             )
           ) as items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN inventory i ON oi.inventory_id = i.id
    WHERE o.id = $1
    GROUP BY o.id, u.username, u.full_name
  `, [id]);
  return result.rows[0];
};

exports.getOrdersByUser = async (userId, limit = 10, offset = 0) => {
  const result = await db.query(`
    SELECT o.*, 
           json_agg(
             json_build_object(
               'inventory_id', oi.inventory_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'item_name', i.name
             )
           ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN inventory i ON oi.inventory_id = i.id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3
  `, [userId, limit, offset]);
  return result.rows;
};

exports.getAllOrders = async (limit = 10, offset = 0, status = '') => {
  let query = `
    SELECT o.*, u.username, u.full_name,
           json_agg(
             json_build_object(
               'inventory_id', oi.inventory_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'item_name', i.name
             )
           ) as items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN inventory i ON oi.inventory_id = i.id
  `;
  const params = [];
  
  if (status) {
    query += ' WHERE o.status = $1';
    params.push(status);
  }
  
  query += ' GROUP BY o.id, u.username, u.full_name ORDER BY o.created_at DESC';
  
  if (params.length > 0) {
    query += ' LIMIT $2 OFFSET $3';
    params.push(limit, offset);
  } else {
    query += ' LIMIT $1 OFFSET $2';
    params.push(limit, offset);
  }
  
  const result = await db.query(query, params);
  return result.rows;
};

exports.getTotalOrdersCount = async (userId = null, status = '') => {
  let query = 'SELECT COUNT(*) FROM orders';
  const params = [];
  
  const conditions = [];
  if (userId) {
    conditions.push('user_id = $' + (params.length + 1));
    params.push(userId);
  }
  if (status) {
    conditions.push('status = $' + (params.length + 1));
    params.push(status);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  const result = await db.query(query, params);
  return parseInt(result.rows[0].count);
};

exports.updateOrderStatus = async (id, status) => {
  const result = await db.query(
    'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

exports.deleteOrder = async (id) => {
  const client = await db.getPool().connect();
  try {
    await client.query('BEGIN');
    
    // Delete order items first
    await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
    // Delete order
    const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
