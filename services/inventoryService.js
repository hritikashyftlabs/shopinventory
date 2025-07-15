const inventoryModel = require('../models/inventoryModel');
const messages = require('../constants/messages');

exports.createItem = async (name, quantity) => {
  const item = await inventoryModel.createItem(name, quantity);
  return { message: messages.ITEM_ADDED, id: item.id };
};

exports.getItems = async () => {
  return await inventoryModel.getItems();
};

exports.getItemById = async (id) => {
  const item = await inventoryModel.getItemById(id);
  if (!item) {
    throw new Error(messages.ITEM_NOT_FOUND);
  }
  return item;
};

exports.updateItem = async (id, name, quantity) => {
  const item = await inventoryModel.updateItem(id, name, quantity);
  if (!item) {
    throw new Error(messages.ITEM_NOT_FOUND);
  }
  return { message: messages.ITEM_UPDATED };
};

exports.deleteItem = async (id) => {
  await inventoryModel.deleteItem(id);
  return { message: messages.ITEM_DELETED };
};
