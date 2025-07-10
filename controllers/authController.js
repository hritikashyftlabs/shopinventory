const authService = require('../services/authService');
const sendResponse = require('../utils/responseHandler');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mysupersecretkey';

exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const result = await authService.registerUser(username, password, role);
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });
    sendResponse(res, 201, "User registered successfully", { ...result, token });
  } catch (err) {
    sendResponse(res, 400, err.message, {});
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await authService.loginUser(username, password);
    sendResponse(res, 200, "User logged in successfully", result);
  } catch (err) {
    sendResponse(res, 400, err.message, {});
  }
};

exports.forgotPassword = (req, res) => {
  const { username } = req.body;
  try {
    const result = authService.generateResetToken(username);
    sendResponse(res, 200, "Reset token generated", result);
  } catch (err) {
    sendResponse(res, 400, err.message, {});
  }
};

exports.resetPassword = async (req, res) => {
  const { username, resetToken, newPassword } = req.body;
  try {
    const result = await authService.resetPassword(username, resetToken, newPassword);
    sendResponse(res, 200, "Password reset successfully", result);
  } catch (err) {
    sendResponse(res, 400, err.message, {});
  }
};
