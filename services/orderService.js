const orderModel = require('../models/orderModel');
const inventoryModel = require('../models/inventoryModel');

exports.createOrder = async (userId, items) => {
  // Validate items and calculate total
  let totalAmount = 0;
  const validatedItems = [];
  
  for (const item of items) {
    const inventoryItem = await inventoryModel.getItemById(item.inventory_id);
    if (!inventoryItem) {
      throw new Error(`Item with ID ${item.inventory_id} not found`);
    }
    if (inventoryItem.quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}`);
    }
    
    const itemTotal = item.quantity * item.price;
    totalAmount += itemTotal;
    
    validatedItems.push({
      inventory_id: item.inventory_id,
      quantity: item.quantity,
      price: item.price
    });
  }
  
  const order = await orderModel.createOrder(userId, validatedItems, totalAmount);
  return order;
};

exports.getOrderById = async (id, userId, isAdmin) => {
  const order = await orderModel.getOrderById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Check authorization
  if (!isAdmin && order.user_id !== userId) {
    throw new Error('Forbidden: You can only access your own orders');
  }
  
  return order;
};

exports.getOrdersByUser = async (userId, limit = 10, offset = 0) => {
  return await orderModel.getOrdersByUser(userId, limit, offset);
};

exports.getAllOrders = async (limit = 10, offset = 0, status = '') => {
  return await orderModel.getAllOrders(limit, offset, status);
};

exports.getTotalOrdersCount = async (userId = null, status = '') => {
  return await orderModel.getTotalOrdersCount(userId, status);
};

exports.updateOrderStatus = async (id, status, userId, isAdmin) => {
  const order = await orderModel.getOrderById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Only admin can update order status
  if (!isAdmin) {
    throw new Error('Forbidden: Only admin can update order status');
  }
  
  const updatedOrder = await orderModel.updateOrderStatus(id, status);
  return updatedOrder;
};

exports.deleteOrder = async (id, userId, isAdmin) => {
  const order = await orderModel.getOrderById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Admin can delete any order, users can only delete their own pending orders
  if (!isAdmin && (order.user_id !== userId || order.status !== 'pending')) {
    throw new Error('Forbidden: You can only delete your own pending orders');
  }
  
  await orderModel.deleteOrder(id);
  return { message: 'Order deleted successfully' };
};