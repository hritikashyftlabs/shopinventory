const Joi = require('joi');

const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      inventory_id: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    })
  ).min(1).required()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').required()
});

const getOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').optional()
});

const orderIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrdersQuerySchema,
  orderIdSchema
};