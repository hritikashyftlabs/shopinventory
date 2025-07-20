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
      const inventoryResponse = await axios.get('/api/inventory');
      const items = inventoryResponse.data.data || [];
      
      setStats({
        totalItems: items.length,
        lowStock: items.filter(item => item.quantity < 10).length,
        totalUsers: 0 // Will implement when users API is ready
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3>Total Items</h3>
          <p style={{ fontSize: '2rem', color: '#007bff' }}>{stats.totalItems}</p>
        </div>
        
        <div className="card">
          <h3>Low Stock Items</h3>
          <p style={{ fontSize: '2rem', color: '#dc3545' }}>{stats.lowStock}</p>
        </div>
        
        <div className="card">
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', color: '#28a745' }}>{stats.totalUsers}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;