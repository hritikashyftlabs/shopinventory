const inventoryService = require('../services/inventoryService');
const sendResponse = require('../utils/responseHandler');

// Get all items
exports.getItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const offset = (page - 1) * limit;
    
    const items = await inventoryService.getItems(limit, offset, search);
    const totalItems = await inventoryService.getTotalCount(search);
    
    sendResponse(res, 200, "Items fetched successfully", {
      items: items,
      totalRecords: totalItems
    });
  } catch (err) {
    sendResponse(res, 500, "Error fetching items", { error: err.message });
  }
};

// Get single item by ID
exports.getSingleItem = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await inventoryService.getItemById(id);
    sendResponse(res, 200, "Item fetched successfully", item);
  } catch (err) {
    if (err.message.includes('not found')) {
      return sendResponse(res, 404, err.message, {});
    }
    sendResponse(res, 500, "Error fetching item", { error: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const item = await inventoryService.createItem(name, quantity);
    sendResponse(res, 201, "Item created successfully", item);
  } catch (err) {
    sendResponse(res, 400, "Error creating item", { error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity } = req.body;
    const item = await inventoryService.updateItem(id, name, quantity);
    if (!item) {
      return sendResponse(res, 404, "Item not found", {});
    }
    sendResponse(res, 200, "Item updated successfully", item);
  } catch (err) {
    sendResponse(res, 400, "Error updating item", { error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await inventoryService.deleteItem(id);
    sendResponse(res, 200, "Item deleted successfully", {});
  } catch (err) {
    sendResponse(res, 400, "Error deleting item", { error: err.message });
  }
};
