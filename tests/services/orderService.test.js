const orderService = require('../../services/orderService');
const orderModel = require('../../models/orderModel');
const inventoryModel = require('../../models/inventoryModel');

jest.mock('../../models/orderModel');
jest.mock('../../models/inventoryModel');

describe('Order Service Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('createOrder should create order and reduce inventory', async () => {
    const fakeInventoryItem = { id: 1, name: 'Laptop', quantity: 10 };
    const fakeOrder = { id: 1, user_id: 1, total_amount: '199.98', status: 'pending' };
    const items = [{ inventory_id: 1, quantity: 2, price: 99.99 }];

    inventoryModel.getItemById.mockReturnValue(Promise.resolve(fakeInventoryItem));
    orderModel.createOrder.mockReturnValue(Promise.resolve(fakeOrder));

    const result = await orderService.createOrder(1, items);

    expect(inventoryModel.getItemById).toHaveBeenCalledWith(1);
    expect(orderModel.createOrder).toHaveBeenCalledWith(1, items, 199.98);
    expect(result).toEqual(fakeOrder);
  });

  test('createOrder should throw error for insufficient stock', async () => {
    const fakeInventoryItem = { id: 1, name: 'Laptop', quantity: 1 };
    const items = [{ inventory_id: 1, quantity: 5, price: 99.99 }];

    inventoryModel.getItemById.mockReturnValue(Promise.resolve(fakeInventoryItem));

    await expect(orderService.createOrder(1, items)).rejects.toThrow('Insufficient stock');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });

  test('createOrder should throw error for non-existent item', async () => {
    const items = [{ inventory_id: 999, quantity: 1, price: 99.99 }];

    inventoryModel.getItemById.mockReturnValue(Promise.resolve(null));

    await expect(orderService.createOrder(1, items)).rejects.toThrow('Item with ID 999 not found');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });
});
