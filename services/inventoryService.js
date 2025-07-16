const inventoryModel = require('../models/inventoryModel');
const messages = require('../constants/messages');

exports.getItems = async (limit = 10, offset = 0, search = '') => {
  return await inventoryModel.getItems(limit, offset, search);
};

exports.getTotalCount = async (search = '') => {
  return await inventoryModel.getTotalCount(search);
};

exports.createItem = async (name, quantity) => {
  const item = await inventoryModel.createItem(name, quantity);
  return { message: messages.ITEM_ADDED, id: item.id };
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
