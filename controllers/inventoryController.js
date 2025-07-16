const Inventory = require('../models/inventoryModel');
const sendResponse = require('../utils/responseHandler');

// Get all items
exports.getItems = async (req, res) => {
  try {
    const items = await Inventory.getItems();
    sendResponse(res, 200, "Items fetched successfully", items);
  } catch (err) {
    sendResponse(res, 500, "Error fetching items", { error: err.message });
  }
};

// Get single item by ID
exports.getSingleItem = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Inventory.getItemById(id);
    if (!item) {
      return sendResponse(res, 404, "Item not found", {});
    }
    return sendResponse(res, 200, "Item fetched successfully", item);
  } catch (err) {
    sendResponse(res, 500, "Error fetching item", { error: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const item = await Inventory.createItem(name, quantity);
    sendResponse(res, 201, "Item created successfully", item);
  } catch (err) {
    sendResponse(res, 400, "Error creating item", { error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity } = req.body;
    const item = await Inventory.updateItem(id, name, quantity);
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
    await Inventory.deleteItem(id);
    sendResponse(res, 200, "Item deleted successfully", {});
  } catch (err) {
    sendResponse(res, 400, "Error deleting item", { error: err.message });
  }
};