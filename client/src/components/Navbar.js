import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">Shop Inventory</div>
      <div className="navbar-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/inventory">Inventory</Link>
        {user?.role === 'admin' && (
          <Link to="/users">Users</Link>
        )}
        <div className="navbar-user">
          <span>Welcome, {user?.username}</span>
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
