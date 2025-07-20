import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">Shop Inventory</div>
      <ul className="navbar-nav">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
        {user?.role === 'admin' && (
          <li><Link to="/users">Users</Link></li>
        )}
        <li>
          <span style={{ marginRight: '10px' }}>Welcome, {user?.username}</span>
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;