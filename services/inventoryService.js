
const inventoryItems = require('../cache/inventoryCache');

exports.createItem = (name, quantity) => {
  const id = Date.now().toString(); // unique ID
  inventoryItems.set(id, { name, quantity });
  return { message: 'Item added', id };
};

exports.getItems = () => {
  const items = [];
  for (const [id, data] of inventoryItems.entries()) {
    items.push({ id, ...data });
  }
  return items;
};

exports.updateItem = (id, name, quantity) => {
  if (!inventoryItems.has(id)) {
    throw new Error('Item not found');
  }
  inventoryItems.set(id, { name, quantity });
  return { message: 'Item updated' };
};

exports.deleteItem = (id) => {
  if (!inventoryItems.has(id)) {
    throw new Error('Item not found');
  }
  inventoryItems.delete(id);
  return { message: 'Item deleted' };
};
