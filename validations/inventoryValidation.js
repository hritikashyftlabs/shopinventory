
const Joi = require('joi');

const createItemSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  quantity: Joi.number().integer().min(0).required(),
  price: Joi.number().positive().optional(),
  description: Joi.string().max(500).optional()
});

const updateItemSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  quantity: Joi.number().integer().min(0).optional(),
  price: Joi.number().positive().optional(),
  description: Joi.string().max(500).optional()
}).min(1);

const getItemsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().max(100).optional()
});

const getItemByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

module.exports = {
  createItemSchema,
  updateItemSchema,
  getItemsQuerySchema,
  getItemByIdSchema
};

