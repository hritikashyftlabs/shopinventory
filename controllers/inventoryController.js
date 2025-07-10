const inventoryCache = require('../models/inventoryModel');
const sendResponse = require('../utils/responseHandler');

exports.getSingleItem = (req, res) => {
  const id = req.params.id;
  const item = inventoryCache.get(id);
  if (!item) {
    return sendResponse(res, 404, "Item not found", {});
  }
  sendResponse(res, 200, "Item fetched successfully", item);
};

exports.createItem = (req, res) => {
  const { name, quantity } = req.body;
  const id = Date.now().toString();
  inventoryCache.set(id, { id, name, quantity });
  sendResponse(res, 201, "Item created", { id, name, quantity });
};

exports.getItems = (req, res) => {
  const items = Array.from(inventoryCache.values());
  const totalRecords = items.length;
  const columnCount = totalRecords > 0 ? Object.keys(items[0]).length : 0;
  sendResponse(res, 200, "Items fetched successfully", {
    totalRecords,
    columnCount,
    items,
  });
};

exports.updateItem = (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;
  if (!inventoryCache.has(id)) {
    return sendResponse(res, 404, "Item not found", {});
  }
  inventoryCache.set(id, { id, name, quantity });
  sendResponse(res, 200, "Item updated", { id, name, quantity });
};

exports.deleteItem = (req, res) => {
  const { id } = req.params;
  if (!inventoryCache.has(id)) {
    return sendResponse(res, 404, "Item not found", {});
  }
  inventoryCache.delete(id);
  sendResponse(res, 200, "Item deleted", {});
};
