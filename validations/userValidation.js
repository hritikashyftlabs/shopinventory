
const Joi = require('joi');

const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('admin', 'user').optional(),
  email: Joi.string().email().optional(),
  fullName: Joi.string().min(2).max(100).optional()
}).min(1);

const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional()
});

module.exports = {
  updateUserSchema,
  getUsersQuerySchema
};

