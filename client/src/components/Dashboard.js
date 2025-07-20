import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [inventoryResponse, usersResponse] = await Promise.all([
        axios.get('/api/inventory'),
        axios.get('/api/users')
      ]);
      
      const items = inventoryResponse.data.data || [];
      const users = usersResponse.data.data || [];
      
      setStats({
        totalItems: items.length,
        lowStock: items.filter(item => item.quantity < 10).length,
        totalUsers: users.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to inventory only if users endpoint fails
      try {
        const inventoryResponse = await axios.get('/api/inventory');
        const items = inventoryResponse.data.data || [];
        setStats({
          totalItems: items.length,
          lowStock: items.filter(item => item.quantity < 10).length,
          totalUsers: 0
        });
      } catch (inventoryError) {
        console.error('Error fetching inventory:', inventoryError);
      }
    }
  };

  return (
    <div className="container">
      <h1>Dashboard Overview</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-card total-items">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Total Items</h3>
            <p className="card-number">{stats.totalItems}</p>
            <span className="card-description">Products in inventory</span>
          </div>
        </div>
        
        <div className="dashboard-card low-stock">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>Low Stock Items</h3>
            <p className="card-number">{stats.lowStock}</p>
            <span className="card-description">Items with &lt; 10 units</span>
          </div>
        </div>
        
        <div className="dashboard-card total-users">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Total Users</h3>
            <p className="card-number">{stats.totalUsers}</p>
            <span className="card-description">Registered users</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
