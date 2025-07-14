const inventoryModel = require('../models/inventoryModel');

exports.createItem = async (name, quantity) => {
  const item = await inventoryModel.createItem(name, quantity);
  return { message: 'Item added', id: item.id };
};

exports.getItems = async () => {
  return await inventoryModel.getItems();
};

exports.getItemById = async (id) => {
  const item = await inventoryModel.getItemById(id);
  if (!item) {
    throw new Error('Item not found');
  }
  return item;
};

exports.updateItem = async (id, name, quantity) => {
  const item = await inventoryModel.updateItem(id, name, quantity);
  if (!item) {
    throw new Error('Item not found');
  }
  return { message: 'Item updated' };
};

exports.deleteItem = async (id) => {
  await inventoryModel.deleteItem(id);
  return { message: 'Item deleted' };
};
