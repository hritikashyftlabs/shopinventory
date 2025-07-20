const db = require('../config/db');

exports.createOrder = async (userId, items, totalAmount) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, totalAmount, 'pending']
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Create order items
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, inventory_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.inventory_id, item.quantity, item.price]
      );
      
      // Reduce inventory
      await client.query(
        'UPDATE inventory SET quantity = quantity - $1 WHERE id = $2',
        [item.quantity, item.inventory_id]
      );
    }
    
    await client.query('COMMIT');
    return orderResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

exports.getOrderById = async (orderId) => {
  const client = await db.connect();
  try {
    // Get order with user details
    const orderResult = await client.query(`
      SELECT o.*, u.username, u.full_name as customer_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.id = $1
    `, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return null;
    }
    
    const order = orderResult.rows[0];
    
    // Get order items with inventory details
    const itemsResult = await client.query(`
      SELECT oi.*, i.name as item_name 
      FROM order_items oi 
      LEFT JOIN inventory i ON oi.inventory_id = i.id 
      WHERE oi.order_id = $1
    `, [orderId]);
    
    order.items = itemsResult.rows;
    return order;
  } finally {
    client.release();
  }
};

exports.updateOrderStatus = async (orderId, status) => {
  const result = await db.query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, orderId]
  );
  return result.rows[0];
};

exports.deleteOrder = async (orderId) => {
  await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
  return true;
};

exports.getAllOrders = async (page, limit, status) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT o.*, u.username, u.full_name as customer_name 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id
  `;
  let params = [];
  
  if (status) {
    query += ' WHERE o.status = $1';
    params.push(status);
  }
  
  query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const result = await db.query(query, params);
  return { orders: result.rows, totalRecords: result.rowCount };
};

exports.getOrdersByUserId = async (userId, page, limit) => {
  const offset = (page - 1) * limit;
  const result = await db.query(`
    SELECT o.*, u.username, u.full_name as customer_name 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    WHERE o.user_id = $1 
    ORDER BY o.created_at DESC 
    LIMIT $2 OFFSET $3
  `, [userId, limit, offset]);
  return { orders: result.rows, totalRecords: result.rowCount };
};

