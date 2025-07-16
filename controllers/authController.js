const authService = require('../services/authService');
const sendResponse = require('../utils/responseHandler');

exports.register = async (req, res) => {
  const { username, password, role, email, fullName } = req.body;
  try {
    const result = await authService.registerUser(username, password, role, email, fullName);
    // Generate JWT token for immediate login after registration
    const loginResult = await authService.loginUser(username, password);
    // Combine registration and login results
    const response = {
      user: result.user,
      token: loginResult.token
    };
    sendResponse(res, 201, "User registered successfully", response);
  } catch (err) {
    sendResponse(res, 400, err.message, {});
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await authService.loginUser(username, password);
    sendResponse(res, 200, "Login successful", result);
  } catch (err) {
    sendResponse(res, 401, err.message, {});
  }
};

exports.forgotPassword = async (req, res) => {
  const { username } = req.body;
  try {
    const result = await authService.generateResetToken(username);
    sendResponse(res, 200, "Reset token generated", result);
  } catch (err) {
    sendResponse(res, 400, err.message, {});
  }
};

exports.resetPassword = async (req, res) => {
  const { username, resetToken, newPassword } = req.body;
  try {
    const result = await authService.resetPassword(username, resetToken, newPassword);
    sendResponse(res, 200, "Password reset successful", result);
  } catch (err) {
    sendResponse(res, 400, err.message, {});
  }
};
