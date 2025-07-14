const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'mysupersecretkey';

exports.registerUser = async (username, password, role, email = null, fullName = null) => {
  if (!username || !password || !role) {
    throw new Error('All fields required: username, password, role');
  }
  
  // Check if user already exists
  const existingUser = await userModel.getUserByUsername(username);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.createUser(username, hashedPassword, role, email, fullName);
  
  // Generate JWT token
  const token = jwt.sign({ id: user.id, username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  
  // Remove password from response
  const { password: pwd, ...safeUser } = user;
  return { 
    message: 'User registered successfully', 
    user: safeUser,
    token 
  };
};

exports.loginUser = async (username, password) => {
  const user = await userModel.getUserByUsername(username);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  const token = jwt.sign({ id: user.id, username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  return { token, user: { id: user.id, username, role: user.role } };
};

exports.generateResetToken = async (username) => {
  // Check if user exists
  const user = await userModel.getUserByUsername(username);
  if (!user) {
    throw new Error('User does not exist');
  }

  // Generate 6-digit OTP
  const token = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  
  // Store token in reset_tokens table
  await db.query(
    'INSERT INTO reset_tokens(username, token, created_at) VALUES($1, $2, NOW()) ' +
    'ON CONFLICT(username) DO UPDATE SET token = $2, created_at = NOW()',
    [username, token]
  );

  return { message: 'Reset token generated', resetToken: token };
};

exports.resetPassword = async (username, resetToken, newPassword) => {
  // Check if user exists
  const user = await userModel.getUserByUsername(username);
  if (!user) {
    throw new Error('User does not exist');
  }

  // Get token from database
  const result = await db.query(
    'SELECT token FROM reset_tokens WHERE username = $1 AND created_at > NOW() - INTERVAL \'15 minutes\'',
    [username]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Reset token expired or not found');
  }
  
  const storedToken = parseInt(result.rows[0].token);
  if (parseInt(resetToken) !== storedToken) {
    throw new Error('Invalid reset token');
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userModel.updateUser(user.id, { password: hashedPassword });

  // Delete used token
  await db.query('DELETE FROM reset_tokens WHERE username = $1', [username]);

  return { message: 'Password reset successful' };
};
