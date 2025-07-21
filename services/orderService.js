const orderModel = require('../models/orderModel');
const inventoryModel = require('../models/inventoryModel');

exports.createOrder = async (userId, items) => {
  console.log('OrderService: Creating order for user:', userId, 'items:', items);
  
  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  let totalAmount = 0;

  // Validate items and calculate total
  for (const item of items) {
    console.log('Processing item:', item);
    
    if (!item.inventory_id || !item.quantity || item.quantity <= 0) {
      throw new Error('Invalid item data: inventory_id and quantity are required');
    }

    const inventoryItem = await inventoryModel.getItemById(item.inventory_id);
    console.log('Found inventory item:', inventoryItem);
    
    if (!inventoryItem) {
      throw new Error(`Item with ID ${item.inventory_id} not found`);
    }
    
    if (inventoryItem.quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`);
    }
    
    // Use inventory price if item price is not provided or is 0
    const itemPrice = (item.price && item.price > 0) ? parseFloat(item.price) : parseFloat(inventoryItem.price);
    console.log('Item price:', itemPrice, 'from item:', item.price, 'from inventory:', inventoryItem.price);
    
    if (!itemPrice || itemPrice <= 0) {
      throw new Error(`Invalid price for item ${inventoryItem.name}. Item price: ${item.price}, Inventory price: ${inventoryItem.price}`);
    }
    
    // Update item with correct price
    item.price = itemPrice;
    totalAmount += item.quantity * itemPrice;
  }

  console.log('Total amount calculated:', totalAmount);

  if (totalAmount <= 0) {
    throw new Error('Order total must be greater than 0');
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

