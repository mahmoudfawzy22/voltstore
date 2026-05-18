import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems }   = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/logo.svg" alt="VoltStore logo" className="logo-img" />
          <span className="logo-text">VoltStore</span>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Products</Link>
          {user && !user.isAdmin && (
            <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>My Orders</Link>
          )}
          {user?.isAdmin && (
            <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}>
              ⚙ Admin
            </Link>
          )}
          {user?.isAdmin && (
            <Link to="/admin/orders" className={`nav-link admin-link ${isActive('/admin/orders') ? 'active' : ''}`}>
              📋 Orders
            </Link>
          )}
          {user?.isAdmin && (
            <Link to="/support" className={`nav-link admin-link ${isActive('/support') ? 'active' : ''}`}>
              💬 Support
            </Link>
          )}
        </div>

        {/* Right side actions */}
        <div className="navbar-actions">
          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
          {user ? (
            <>
              {!user.isAdmin && (
              <Link to="/cart" className="cart-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {totalItems > 0 && <span className="badge">{totalItems}</span>}
              </Link>
              )}
              <div className="user-menu">
                <button className="user-avatar" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.name.charAt(0).toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <span className="dropdown-name">{user.name}</span>
                      <span className="dropdown-email">{user.email}</span>
                    </div>
                    {!user.isAdmin && <Link to="/orders" className="dropdown-item" onClick={() => setMenuOpen(false)}>My Orders</Link>}
                    <button className="dropdown-item danger" onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Products</Link>
          {user ? (
            <>
              {!user.isAdmin && <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({totalItems})</Link>}
              {!user.isAdmin && <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>}
              {user?.isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>⚙ Admin Panel</Link>
              )}
              {user?.isAdmin && (
                <Link to="/admin/orders" onClick={() => setMenuOpen(false)}>📋 Order Management</Link>
              )}
              {user?.isAdmin && (
                <Link to="/support" onClick={() => setMenuOpen(false)}>💬 Support Inbox</Link>
              )}
              <button onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
