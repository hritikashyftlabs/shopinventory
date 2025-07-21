
const orderService = require('../services/orderService');
const sendResponse = require('../utils/responseHandler');

exports.createOrder = async (req, res) => {
  try {
    console.log('Order creation request:', req.body);
    const { items } = req.body;
    const userId = req.user.id;
    
    // Validate request data
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Validation failed: Items array is required');
      return sendResponse(res, 400, "Items array is required", {});
    }
    
    console.log('Creating order for user:', userId, 'with items:', items);
    const order = await orderService.createOrder(userId, items);
    console.log('Order created successfully:', order);
    sendResponse(res, 201, "Order created successfully", order);
  } catch (error) {
    console.error('Order creation error:', error);
    sendResponse(res, 400, error.message, { error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const order = await orderService.getOrderById(id, userId, isAdmin);
    sendResponse(res, 200, "Order fetched successfully", order);
  } catch (error) {
    const statusCode = error.message === 'Forbidden' ? 403 : 404;
    sendResponse(res, statusCode, "Error fetching order", { error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await orderService.updateOrderStatus(id, status);
    sendResponse(res, 200, "Order status updated successfully", result);
  } catch (error) {
    sendResponse(res, 400, "Error updating order status", { error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const result = await orderService.deleteOrder(id, userId, isAdmin);
    sendResponse(res, 200, "Order deleted successfully", result);
  } catch (error) {
    const statusCode = error.message === 'Forbidden' ? 403 : 404;
    sendResponse(res, statusCode, "Error deleting order", { error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const orders = await orderService.getAllOrders(parseInt(page), parseInt(limit), status);
    sendResponse(res, 200, "All orders fetched successfully", orders);
  } catch (error) {
    sendResponse(res, 400, "Error fetching orders", { error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    const orders = await orderService.getMyOrders(userId, parseInt(page), parseInt(limit));
    sendResponse(res, 200, "Orders fetched successfully", orders);
  } catch (error) {
    sendResponse(res, 400, "Error fetching orders", { error: error.message });
  }
};
