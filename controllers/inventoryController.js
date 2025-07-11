const Inventory = require('../models/inventoryModel');
const sendResponse = require('../utils/responseHandler');

exports.getSingleItem = (req, res) => {
  const id = req.params.id;
  const item = inventoryCache.get(id);
  if (!item) {
    return sendResponse(res, 404, "Item not found", {});
  }
  return sendResponse(res, 200, "Item fetched successfully", item);
};

exports.createItem = async (req, res) => {
  const { name, quantity } = req.body;
  const item = await Inventory.createItem(name, quantity);
  res.status(201).json({ status: 201, message: 'Item created', data: item });
};

exports.getItems = (req, res) => {
  const items = Array.from(inventoryCache.values());
  sendResponse(res, 200, "Items fetched successfully", items);
};

exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;
  const item = await Inventory.updateItem(id, name, quantity);
  if (!item) {
    return res.status(404).json({ status: 404, message: 'Item not found', data: {} });
  }
  res.status(200).json({ status: 200, message: 'Item updated', data: item });
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  await Inventory.deleteItem(id);
  res.status(200).json({ status: 200, message: 'Item deleted', data: {} });
};