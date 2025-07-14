const authService = require('../../services/authService');
const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');


jest.mock('../../models/userModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../config/db');

describe('Auth Service Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('registerUser should register a new user and return token', async () => {
    const fakeUser = { 
      id: 1, 
      username: 'testuser', 
      password: 'hashedpwd', 
      role: 'user',
      email: 'test@example.com'
    };
    
    userModel.getUserByUsername.mockReturnValue(Promise.resolve(null));
    bcrypt.hash.mockReturnValue(Promise.resolve('hashedpwd'));
    userModel.createUser.mockReturnValue(Promise.resolve(fakeUser));
    jwt.sign.mockReturnValue('fake-token');
    
    // Call function
    const result = await authService.registerUser(
      'testuser', 'password123', 'user', 'test@example.com', 'Test User'
    );
    
    // Check results
    expect(userModel.getUserByUsername).toHaveBeenCalledWith('testuser');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(userModel.createUser).toHaveBeenCalledWith(
      'testuser', 'hashedpwd', 'user', 'test@example.com', 'Test User'
    );
    expect(jwt.sign).toHaveBeenCalled();
    expect(result.token).toBe('fake-token');
    expect(result.user.password).toBeUndefined();
    expect(result.message).toContain('registered');
  });

  test('registerUser should throw error if username already exists', async () => {
    // Setup - user already exists
    userModel.getUserByUsername.mockReturnValue(Promise.resolve({ username: 'testuser' }));
    
    // Call function & check error
    let errorThrown = false;
    try {
      await authService.registerUser('testuser', 'password123', 'user');
    } catch (err) {
      errorThrown = true;
      expect(err.message).toBe('User already exists');
    }
    
    expect(errorThrown).toBe(true);
    // Make sure other functions weren't called
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(userModel.createUser).not.toHaveBeenCalled();
  });

  test('registerUser should throw error if required fields missing', async () => {
    // Call function with missing password
    let errorThrown = false;
    try {
      await authService.registerUser('testuser', '', 'user');
    } catch (err) {
      errorThrown = true;
      expect(err.message).toContain('All fields required');
    }
    
    // Make sure error was thrown
    expect(errorThrown).toBe(true);
    // Make sure other functions weren't called
    expect(userModel.getUserByUsername).not.toHaveBeenCalled();
  });

  test('loginUser should return token if credentials valid', async () => {
    // Setup fake user
    const fakeUser = { 
      id: 1, 
      username: 'testuser', 
      password: 'hashedpwd', 
      role: 'user' 
    };
    
    // Setup mocks
    userModel.getUserByUsername.mockReturnValue(Promise.resolve(fakeUser));
    bcrypt.compare.mockReturnValue(Promise.resolve(true));
    jwt.sign.mockReturnValue('fake-token');
    
    // Call function
    const result = await authService.loginUser('testuser', 'password123');
    
    // Check results
    expect(userModel.getUserByUsername).toHaveBeenCalledWith('testuser');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpwd');
    expect(jwt.sign).toHaveBeenCalled();
    expect(result.token).toBe('fake-token');
    expect(result.user.id).toBe(1);
    expect(result.user.role).toBe('user');
  });

  test('loginUser should throw error if password incorrect', async () => {
    const fakeUser = { 
      id: 1, 
      username: 'testuser', 
      password: 'hashedpwd', 
      role: 'user' 
    };
    
    // Setup mocks
    userModel.getUserByUsername.mockReturnValue(Promise.resolve(fakeUser));
    bcrypt.compare.mockReturnValue(Promise.resolve(false)); // Password doesn't match
    
    // Call function & check error
    let errorThrown = false;
    try {
      await authService.loginUser('testuser', 'wrongpassword');
    } catch (err) {
      errorThrown = true;
      expect(err.message).toBe('Invalid credentials');
    }
    
    expect(errorThrown).toBe(true);
    // Make sure token wasn't generated
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test('generateResetToken should create token for valid user', async () => {
    
    const fakeUser = { 
      id: 1, 
      username: 'testuser', 
      password: 'hashedpwd' 
    };
    
    userModel.getUserByUsername.mockReturnValue(Promise.resolve(fakeUser));
    db.query.mockReturnValue(Promise.resolve({ rowCount: 1 }));

    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.5);
    
    // Call function
    const result = await authService.generateResetToken('testuser');
    
    // Check results
    expect(userModel.getUserByUsername).toHaveBeenCalledWith('testuser');
    expect(db.query).toHaveBeenCalled();
    expect(result.message).toContain('Reset token generated');
    expect(result.resetToken).toBe(550000);
    
    // Restore Math.random
    Math.random = originalRandom;
  });

  test('resetPassword should update password if token valid', async () => {
    const fakeUser = { 
      id: 1, 
      username: 'testuser', 
      password: 'oldhash' 
    };
    
    userModel.getUserByUsername.mockReturnValue(Promise.resolve(fakeUser));
    db.query.mockImplementation((query) => {
      // For the SELECT query
      if (query.includes('SELECT')) {
        return Promise.resolve({ rows: [{ token: '123456' }] });
      }
      // For the DELETE query
      return Promise.resolve({ rowCount: 1 });
    });
    bcrypt.hash.mockReturnValue(Promise.resolve('newhash'));
    userModel.updateUser.mockReturnValue(Promise.resolve({ ...fakeUser, password: 'newhash' }));
    
    // Call function
    const result = await authService.resetPassword('testuser', '123456', 'newpassword');
    
    // Check results
    expect(userModel.getUserByUsername).toHaveBeenCalledWith('testuser');
    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    expect(userModel.updateUser).toHaveBeenCalledWith(1, { password: 'newhash' });
    expect(result.message).toBe('Password reset successful');
  });

  test('resetPassword should throw error if token invalid', async () => {
    // Setup fake user
    const fakeUser = { 
      id: 1, 
      username: 'testuser', 
      password: 'oldhash' 
    };
    
    // Setup mocks
    userModel.getUserByUsername.mockReturnValue(Promise.resolve(fakeUser));
    db.query.mockReturnValue(Promise.resolve({ rows: [{ token: '123456' }] }));
    
    // Call function with wrong token & check error
    let errorThrown = false;
    try {
      await authService.resetPassword('testuser', '654321', 'newpassword');
    } catch (err) {
      errorThrown = true;
      expect(err.message).toBe('Invalid reset token');
    }
    
    // Make sure error was thrown
    expect(errorThrown).toBe(true);
    // Make sure password wasn't updated
    expect(userModel.updateUser).not.toHaveBeenCalled();
  });

  test('resetPassword should throw error if token expired', async () => {
    // Setup fake user
    const fakeUser = { 
      id: 1, 
      username: 'testuser', 
      password: 'oldhash' 
    };
    
    // Setup mocks
    userModel.getUserByUsername.mockReturnValue(Promise.resolve(fakeUser));
    db.query.mockReturnValue(Promise.resolve({ rows: [] })); // No token found
    
    // Call function & check error
    let errorThrown = false;
    try {
      await authService.resetPassword('testuser', '123456', 'newpassword');
    } catch (err) {
      errorThrown = true;
      expect(err.message).toBe('Reset token expired or not found');
    }
    
    expect(errorThrown).toBe(true);
    // Make sure password wasn't updated
    expect(userModel.updateUser).not.toHaveBeenCalled();
  });
});