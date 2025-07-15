const orderController = require('../../controllers/orderController');
const orderService = require('../../services/orderService');
const sendResponse = require('../../utils/responseHandler');

jest.mock('../../services/orderService');
jest.mock('../../utils/responseHandler');

describe('Order Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, role: 'user' }
    };
    res = {};
  });

  test('createOrder should create order successfully', async () => {
    req.body = { items: [{ inventory_id: 1, quantity: 2, price: 99.99 }] };
    const fakeOrder = { id: 1, status: 'pending' };
    orderService.createOrder.mockReturnValue(Promise.resolve(fakeOrder));

    await orderController.createOrder(req, res);

    expect(orderService.createOrder).toHaveBeenCalledWith(1, req.body.items);
    expect(sendResponse).toHaveBeenCalledWith(res, 201, "Order created successfully", fakeOrder);
  });

  test('createOrder should handle errors', async () => {
    req.body = { items: [] };
    orderService.createOrder.mockRejectedValue(new Error('Insufficient stock'));

    await orderController.createOrder(req, res);

    expect(sendResponse).toHaveBeenCalledWith(res, 400, "Error creating order", { error: 'Insufficient stock' });
  });
});
