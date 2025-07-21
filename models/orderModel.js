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
    
    // Create order items and reduce inventory
    for (const item of items) {
      // Validate item data
      if (!item.inventory_id || !item.quantity || !item.price) {
        throw new Error('Invalid item data in order');
      }

      // Insert order item
      await client.query(
        'INSERT INTO order_items (order_id, inventory_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.inventory_id, item.quantity, item.price]
      );
      
      // Check current inventory before reducing
      const inventoryCheck = await client.query(
        'SELECT quantity FROM inventory WHERE id = $1',
        [item.inventory_id]
      );
      
      if (inventoryCheck.rows.length === 0) {
        throw new Error(`Inventory item ${item.inventory_id} not found`);
      }
      
      if (inventoryCheck.rows[0].quantity < item.quantity) {
        throw new Error(`Insufficient inventory for item ${item.inventory_id}`);
      }
      
      // Reduce inventory
      const updateResult = await client.query(
        'UPDATE inventory SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1 RETURNING *',
        [item.quantity, item.inventory_id]
      );
      
      if (updateResult.rows.length === 0) {
        throw new Error(`Failed to update inventory for item ${item.inventory_id}`);
      }
    }
    
    await client.query('COMMIT');
    return orderResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
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
  const client = await db.connect();
  try {
    const result = await client.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

exports.deleteOrder = async (orderId) => {
  const client = await db.connect();
  try {
    await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
    return true;
  } finally {
    client.release();
  }
};

exports.getAllOrders = async (page, limit, status) => {
  const client = await db.connect();
  try {
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
    
    const result = await client.query(query, params);
    return { orders: result.rows, totalRecords: result.rowCount };
  } finally {
    client.release();
  }
};

exports.getOrdersByUserId = async (userId, page, limit) => {
  const client = await db.connect();
  try {
    const offset = (page - 1) * limit;
    const result = await client.query(`
      SELECT o.*, u.username, u.full_name as customer_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.user_id = $1 
      ORDER BY o.created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    return { orders: result.rows, totalRecords: result.rowCount };
  } finally {
    client.release();
  }
};

