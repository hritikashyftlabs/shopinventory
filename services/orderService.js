const orderModel = require('../models/orderModel');
const inventoryModel = require('../models/inventoryModel');

exports.createOrder = async (userId, items) => {
  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  let totalAmount = 0;

  // Validate items and calculate total
  for (const item of items) {
    const inventoryItem = await inventoryModel.getItemById(item.inventory_id);
    
    if (!inventoryItem) {
      throw new Error(`Item with ID ${item.inventory_id} not found`);
    }
    
    if (inventoryItem.quantity < item.quantity) {
      throw new Error('Insufficient stock');
    }
    
    totalAmount += item.quantity * item.price;
  }

  return await orderModel.createOrder(userId, items, totalAmount);
};

exports.getOrderById = async (orderId, userId, isAdmin) => {
  const order = await orderModel.getOrderById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (!isAdmin && order.user_id !== userId) {
    throw new Error('Forbidden');
  }
  
  return order;
};

exports.updateOrderStatus = async (orderId, status) => {
  const order = await orderModel.updateOrderStatus(orderId, status);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  return { message: 'Order status updated' };
};

exports.deleteOrder = async (orderId, userId, isAdmin) => {
  const order = await orderModel.getOrderById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (!isAdmin) {
    if (order.user_id !== userId) {
      throw new Error('Forbidden');
    }
    if (order.status !== 'pending') {
      throw new Error('Forbidden');
    }
  }
  
  await orderModel.deleteOrder(orderId);
  return { message: 'Order deleted' };
};

exports.getAllOrders = async (page = 1, limit = 10, status) => {
  return await orderModel.getAllOrders(page, limit, status);
};

exports.getMyOrders = async (userId, page = 1, limit = 10) => {
  return await orderModel.getOrdersByUserId(userId, page, limit);
};

