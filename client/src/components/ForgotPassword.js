import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Request token, 2: Reset password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot', { username });
      setMessage('Reset token has been sent. Please check your email or contact admin.');
      setStep(2);
    } catch (error) {
      console.error('Token request failed:', error);
      setError(error.response?.data?.message || 'Failed to request reset token');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/reset-password', {
        username,
        resetToken,
        newPassword
      });
      
      setMessage('Password has been reset successfully. You can now login with your new password.');
    } catch (error) {
      console.error('Password reset failed:', error);
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <h1>Shop Inventory</h1>
          </div>
        </div>
        
        <div className="login-card">
          <h2>Reset Password</h2>
          <p className="login-subtitle">
            {step === 1 ? 'Request a password reset token' : 'Enter your reset token'}
          </p>
          
          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {message && (
            <div className="success-alert">
              <span className="success-icon">✅</span>
              {message}
            </div>
          )}
          
          {step === 1 ? (
            <form className="login-form" onSubmit={handleRequestToken}>
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className={`login-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Requesting Token...
                  </>
                ) : (
                  'Request Reset Token'
                )}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleResetPassword}>
              <div className="input-group">
                <label htmlFor="resetToken">Reset Token</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔑</span>
                  <input
                    id="resetToken"
                    type="text"
                    placeholder="Enter the reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className={`login-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
          
          <div className="register-link">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;