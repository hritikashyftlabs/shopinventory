const orderService = require('../services/orderService');
const sendResponse = require('../utils/responseHandler');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;  // Uses logged-in user's ID
    
    const order = await orderService.createOrder(userId, items);
    sendResponse(res, 201, "Order created successfully", order);
  } catch (err) {
    sendResponse(res, 400, "Error creating order", { error: err.message });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const order = await orderService.getOrderById(id, userId, isAdmin);
    sendResponse(res, 200, "Order fetched successfully", order);
  } catch (err) {
    if (err.message.includes('Forbidden')) {
      return sendResponse(res, 403, err.message, {});
    }
    if (err.message.includes('not found')) {
      return sendResponse(res, 404, err.message, {});
    }
    sendResponse(res, 500, "Error fetching order", { error: err.message });
  }
};

// Get customer's own orders
exports.getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const userId = req.user.id;
    
    const orders = await orderService.getOrdersByUser(userId, limit, offset);
    const totalOrders = await orderService.getTotalOrdersCount(userId);
    
    sendResponse(res, 200, "Orders fetched successfully", {
      orders: orders,
      totalRecords: totalOrders
    });
  } catch (err) {
    sendResponse(res, 500, "Error fetching orders", { error: err.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const offset = (page - 1) * limit;
    
    const orders = await orderService.getAllOrders(limit, offset, status);
    const totalOrders = await orderService.getTotalOrdersCount(null, status);
    
    sendResponse(res, 200, "All orders fetched successfully", {
      orders: orders,
      totalRecords: totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit)
    });
  } catch (err) {
    sendResponse(res, 500, "Error fetching orders", { error: err.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const order = await orderService.updateOrderStatus(id, status, userId, isAdmin);
    sendResponse(res, 200, "Order status updated successfully", order);
  } catch (err) {
    if (err.message.includes('Forbidden')) {
      return sendResponse(res, 403, err.message, {});
    }
    if (err.message.includes('not found')) {
      return sendResponse(res, 404, err.message, {});
    }
    sendResponse(res, 400, "Error updating order status", { error: err.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    await orderService.deleteOrder(id, userId, isAdmin);
    sendResponse(res, 200, "Order deleted successfully", {});
  } catch (err) {
    if (err.message.includes('Forbidden')) {
      return sendResponse(res, 403, err.message, {});
    }
    if (err.message.includes('not found')) {
      return sendResponse(res, 404, err.message, {});
    }
    sendResponse(res, 400, "Error deleting order", { error: err.message });
  }
};
