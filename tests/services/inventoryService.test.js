const inventoryService = require('../../services/inventoryService');
const inventoryModel = require('../../models/inventoryModel');

jest.mock('../../models/inventoryModel');

describe('Inventory Service Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('createItem should create an item and return success message', async () => {
    const fakeItem = { id: 1, name: 'Test Item', quantity: 10 };
    inventoryModel.createItem.mockReturnValue(Promise.resolve(fakeItem));
    
    const result = await inventoryService.createItem('Test Item', 10);
    
    expect(inventoryModel.createItem).toHaveBeenCalledWith('Test Item', 10);
    expect(result).toEqual({ message: 'Item added', id: 1 });
  });

  test('getItems should return all items', async () => {
    const fakeItems = [
      { id: 1, name: 'Item 1', quantity: 10 },
      { id: 2, name: 'Item 2', quantity: 20 }
    ];
    inventoryModel.getItems.mockReturnValue(Promise.resolve(fakeItems));
    
    const result = await inventoryService.getItems();
    
    expect(inventoryModel.getItems).toHaveBeenCalled();
    expect(result).toEqual(fakeItems);
  });

  test('getItemById should return item if found', async () => {
    const fakeItem = { id: 1, name: 'Test Item', quantity: 10 };
    inventoryModel.getItemById.mockReturnValue(Promise.resolve(fakeItem));
    
    const result = await inventoryService.getItemById(1);
    
    expect(inventoryModel.getItemById).toHaveBeenCalledWith(1);
    expect(result).toEqual(fakeItem);
  });

  test('getItemById should throw error if item not found', async () => {
    inventoryModel.getItemById.mockReturnValue(Promise.resolve(null));
    
    await expect(inventoryService.getItemById(999)).rejects.toThrow('Item not found');
    expect(inventoryModel.getItemById).toHaveBeenCalledWith(999);
  });

  test('updateItem should update item and return success message', async () => {
    const fakeItem = { id: 1, name: 'Updated Item', quantity: 15 };
    inventoryModel.updateItem.mockReturnValue(Promise.resolve(fakeItem));
    
    const result = await inventoryService.updateItem(1, 'Updated Item', 15);
    
    expect(inventoryModel.updateItem).toHaveBeenCalledWith(1, 'Updated Item', 15);
    expect(result).toEqual({ message: 'Item updated' });
  });

  test('updateItem should throw error if item not found', async () => {
    inventoryModel.updateItem.mockReturnValue(Promise.resolve(null));
    
    await expect(inventoryService.updateItem(999, 'Not Found', 0)).rejects.toThrow('Item not found');
    expect(inventoryModel.updateItem).toHaveBeenCalledWith(999, 'Not Found', 0);
  });

  test('deleteItem should delete item and return success message', async () => {
    inventoryModel.deleteItem.mockReturnValue(Promise.resolve(true));
    
    const result = await inventoryService.deleteItem(1);
    
    expect(inventoryModel.deleteItem).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Item deleted' });
  });
});