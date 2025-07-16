const userService = require('../../services/userService');
const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');

jest.mock('../../models/userModel');
jest.mock('bcryptjs');

describe('User Service Tests', () => {
  // Clean up between tests
  beforeEach(() => {
    jest.resetAllMocks();
  });

 
  test('getAllUsers should remove passwords from user objects', async () => {
    const fakeUsers = [
      { id: 1, username: 'bob', password: 'secret1', role: 'user' },
      { id: 2, username: 'admin', password: 'secret2', role: 'admin' }
    ];
    
  
    userModel.getUsers.mockReturnValue(Promise.resolve(fakeUsers));
    const result = await userService.getAllUsers();
    
    // Check the results
    expect(userModel.getUsers).toHaveBeenCalled();
    expect(result.length).toBe(2);
    // Passwords should be removed
    expect(result[0].password).toBe(undefined);
    expect(result[1].password).toBe(undefined);
    // But other fields remain
    expect(result[0].username).toBe('bob');
    expect(result[1].role).toBe('admin');
  });

  
  test('getUserById should let users see their own profile', async () => {
    const fakeUser = { 
      id: 5, 
      username: 'bob', 
      password: 'hashedstuff', 
      role: 'user' 
    };
    
    // Make getUserById return our fake data
    userModel.getUserById.mockReturnValue(Promise.resolve(fakeUser));
    
    const result = await userService.getUserById(5, 5, false);
    expect(userModel.getUserById).toHaveBeenCalledWith(5);
    expect(result.password).toBe(undefined); // Password should be removed
    expect(result.username).toBe('bob');
  });

  test('getUserById should block users from seeing other profiles', async () => {
    // Call function - user 1 trying to see profile 2
    let errorThrown = false;
    try {
      await userService.getUserById(2, 1, false);
    } catch (err) {
      errorThrown = true;
      expect(err.message).toMatch(/Forbidden/);
      expect(err.message).toMatch(/own profile/);
    }
    expect(errorThrown).toBe(true);
    // Make sure database wasn't called
    expect(userModel.getUserById).not.toHaveBeenCalled();
  });

  test('getUserById should let admins see any profile', async () => {
    const fakeUser = { 
      id: 10, 
      username: 'bob', 
      password: 'hashedstuff', 
      role: 'user' 
    };
    
    userModel.getUserById.mockReturnValue(Promise.resolve(fakeUser));
    
    // Call function - admin looking at profile 10
    const result = await userService.getUserById(10, 999, true);
    
    // Check results
    expect(userModel.getUserById).toHaveBeenCalledWith(10);
    expect(result.password).toBe(undefined); // Password should be removed
  });

  test('update user ', async () => {
    // Setup fake user and update data
    const fakeUser = { 
      id: 3, 
      username: 'bob', 
      password: 'oldhash', 
      role: 'user' 
    };
    const updates = { password: 'newpass123' };
    
    // Setup mocks
    userModel.getUserById.mockReturnValue(Promise.resolve(fakeUser));
    userModel.updateUser.mockReturnValue(Promise.resolve({ 
      ...fakeUser, 
      password: 'newhash' 
    }));
    bcrypt.hash.mockReturnValue(Promise.resolve('newhash'));
    
    // Call function
    await userService.updateUser(3, updates, 3, false);
    
    // Check results
    expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
    expect(userModel.updateUser).toHaveBeenCalledWith(3, { 
      password: 'newhash' 
    });
  });

  test('updateUser should convert fullName to full_name', async () => {
    // Setup fake user and update data
    const fakeUser = { 
      id: 4, 
      username: 'bob', 
      password: 'hash', 
      role: 'user' 
    };
    const updates = { fullName: 'Bob Smith' };
    
    // Setup mocks
    userModel.getUserById.mockReturnValue(Promise.resolve(fakeUser));
    userModel.updateUser.mockReturnValue(Promise.resolve({ 
      ...fakeUser, 
      full_name: 'Bob Smith' 
    }));
    
    // Call function
    await userService.updateUser(4, updates, 4, false);
    
    // Check results
    expect(userModel.updateUser).toHaveBeenCalledWith(4, { 
      full_name: 'Bob Smith' 
    });
  });

  // Test deleteUser
  test('deleteUser should let users delete their own account', async () => {
    // Setup fake user
    const fakeUser = { 
      id: 7, 
      username: 'bob', 
      password: 'hash', 
      role: 'user' 
    };
    
    // Setup mocks
    userModel.getUserById.mockReturnValue(Promise.resolve(fakeUser));
    userModel.deleteUser.mockReturnValue(Promise.resolve(true));
    
    // Call function - user 7 deleting account 7 (their own)
    const result = await userService.deleteUser(7, 7, false);
    
    // Check results
    expect(userModel.deleteUser).toHaveBeenCalledWith(7);
    expect(result).toEqual({ success: true });
  });

  test('deleteUser should block users from deleting other accounts', async () => {
    // Call function - user 8 trying to delete account 9
    let errorThrown = false;
    try {
      await userService.deleteUser(9, 8, false);
    } catch (err) {
      errorThrown = true;
      expect(err.message).toMatch(/Forbidden/);
      expect(err.message).toMatch(/own account/);
    }
    
    // Make sure error was thrown
    expect(errorThrown).toBe(true);
    // Make sure database wasn't called
    expect(userModel.deleteUser).not.toHaveBeenCalled();
  });
});
