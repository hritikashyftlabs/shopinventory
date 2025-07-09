
const authService = require('../services/authService');

exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const result = await authService.registerUser(username, password, role);
    // JWT with role in payload
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'mysupersecretkey';
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ ...result, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await authService.loginUser(username, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.forgotPassword = (req, res) => {
  const { username } = req.body;
  try {
    const result = authService.generateResetToken(username);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { username, resetToken, newPassword } = req.body;
  try {
    const result = await authService.resetPassword(username, resetToken, newPassword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
