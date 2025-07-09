
const inventoryService = require('../services/inventoryService');

exports.createItem = (req, res) => {
  const { name, quantity } = req.body;
  try {
    const result = inventoryService.createItem(name, quantity);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getItems = (req, res) => {
  try {
    const result = inventoryService.getItems();
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateItem = (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;
  try {
    const result = inventoryService.updateItem(id, name, quantity);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteItem = (req, res) => {
  const { id } = req.params;
  try {
    const result = inventoryService.deleteItem(id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
