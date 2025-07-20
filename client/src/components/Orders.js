import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [newOrder, setNewOrder] = useState({
    items: [{ inventory_id: '', quantity: 1, price: 0 }]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Add order details state and functions
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchInventoryItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const endpoint = user.role === 'admin' ? '/api/orders' : '/api/orders/my/orders';
      const response = await axios.get(endpoint);
      setOrders(response.data.data?.orders || response.data.data || []);
    } catch (error) {
      setMessage('Error fetching orders');
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get('/api/inventory');
      setInventoryItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleAddOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { inventory_id: '', quantity: 1, price: 0 }]
    });
  };

  const handleRemoveOrderItem = (index) => {
    const items = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items });
  };

  const handleOrderItemChange = (index, field, value) => {
    const items = [...newOrder.items];
    items[index][field] = value;
    
    // Auto-fill price when inventory item is selected
    if (field === 'inventory_id') {
      const selectedItem = inventoryItems.find(item => item.id === parseInt(value));
      if (selectedItem) {
        items[index].price = selectedItem.price || 0;
      }
    }
    
    setNewOrder({ ...newOrder, items });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/orders', newOrder);
      setNewOrder({
        items: [{ inventory_id: '', quantity: 1, price: 0 }]
      });
      setMessage('Order created successfully');
      fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      setMessage('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      setMessage('Error updating order status');
    }
  };

  const calculateTotal = () => {
    return newOrder.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0).toFixed(2);
  };

  // Add function to fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data.data);
      setShowOrderDetails(true);
    } catch (error) {
      setMessage('Error fetching order details');
    }
  };

  return (
    <div className="container">
      <h1>Order Management</h1>
      
      {message && <div className="success-message">{message}</div>}
      
      {/* Create Order Form */}
      <div className="card">
        <h3>Create New Order</h3>
        <form onSubmit={handleCreateOrder}>
          {newOrder.items.map((item, index) => (
            <div key={index} className="order-item">
              <div className="form-group">
                <label>Item:</label>
                <select
                  value={item.inventory_id}
                  onChange={(e) => handleOrderItemChange(index, 'inventory_id', e.target.value)}
                  required
                >
                  <option value="">Select Item</option>
                  {inventoryItems.map(invItem => (
                    <option key={invItem.id} value={invItem.id}>
                      {invItem.name} (Stock: {invItem.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleOrderItemChange(index, 'quantity', parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleOrderItemChange(index, 'price', parseFloat(e.target.value))}
                  required
                />
              </div>
              {newOrder.items.length > 1 && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleRemoveOrderItem(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <div className="order-actions">
            <button type="button" className="btn btn-secondary" onClick={handleAddOrderItem}>
              Add Item
            </button>
            <div className="order-total">
              <strong>Total: ${calculateTotal()}</strong>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>

      {/* Orders List */}
      <div className="card">
        <h3>{user.role === 'admin' ? 'All Orders' : 'My Orders'}</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Created At</th>
              {user.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer_name || order.username || `User ${order.user_id}`}</td>
                <td>${order.total_amount}</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-info btn-sm"
                    onClick={() => fetchOrderDetails(order.id)}
                  >
                    View Details
                  </button>
                  {user.role === 'admin' && (
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      style={{ marginLeft: '10px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.id}</h3>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => setShowOrderDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Customer:</strong> {selectedOrder.customer_name || selectedOrder.username || `User ${selectedOrder.user_id}`}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Total Amount:</strong> ${selectedOrder.total_amount}</p>
              <p><strong>Created:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              
              <h4>Order Items:</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item_name || `Item ${item.inventory_id}`}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td>${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
