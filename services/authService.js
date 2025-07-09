
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../cache/userCache');
const resetTokens = require('../cache/resetTokenCache');

const JWT_SECRET = process.env.JWT_SECRET || 'mysupersecretkey';

exports.registerUser = async (username, password, role) => {
  if (!username || !password || !role) {
    throw new Error('All fields required: username, password, role');
  }
  if (users.has(username)) {
    throw new Error('User already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(username, { password: hashedPassword, role });
  return { message: 'User registered successfully' };
};

exports.loginUser = async (username, password) => {
  const user = users.get(username);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  return { token };
};

exports.generateResetToken = (username) => {
  if (!users.has(username)) {
    throw new Error('User does not exist');
  }

  const token = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  resetTokens.set(username, token);

  return { message: 'Reset token generated', resetToken: token };
};

exports.resetPassword = async (username, resetToken, newPassword) => {
  if (!users.has(username)) {
    throw new Error('User does not exist');
  }

  const storedToken = resetTokens.get(username);
  if (parseInt(resetToken) !== storedToken) {
    throw new Error('Invalid reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  users.set(username, { password: hashedPassword });

  resetTokens.delete(username);

  return { message: 'Password reset successful' };
};
