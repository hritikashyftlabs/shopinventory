const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user').required(),
  email: Joi.string().email().optional(),
  fullName: Joi.string().min(2).max(100).optional()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  username: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
  username: Joi.string().required(),
  resetToken: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  newPassword: Joi.string().min(6).required()
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
