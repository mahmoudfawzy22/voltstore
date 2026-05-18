import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">

        {/* Brand column */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src="/logo.svg" alt="VoltStore" className="footer-logo-img" />
            <span className="footer-logo-text">VoltStore</span>
          </Link>
          <p className="footer-tagline">
            Your one-stop shop for premium electronics and tech accessories.
          </p>
          <div className="footer-socials">
            {/* Twitter / X */}
            <a href="#" className="social-btn" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="social-btn" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="#" className="social-btn" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.3 2.8 12 2.8 12 2.8s-4.3 0-6.8.2c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 22 12 22 12 22s4.3 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.3 23 7 23 7zM9.7 15.5V8.4l6.5 3.6-6.5 3.5z"/>
              </svg>
            </a>
            {/* GitHub */}
            <a href="#" className="social-btn" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Shop column */}
        <div className="footer-col">
          <h4 className="footer-heading">Shop</h4>
          <ul className="footer-links">
            <li><Link to="/">All Products</Link></li>
            <li><Link to="/?search=audio">Audio</Link></li>
            <li><Link to="/?search=keyboard">Keyboards</Link></li>
            <li><Link to="/?search=camera">Cameras</Link></li>
            <li><Link to="/?search=storage">Storage</Link></li>
            <li><Link to="/?search=monitor">Displays</Link></li>
          </ul>
        </div>

        {/* Account column */}
        <div className="footer-col">
          <h4 className="footer-heading">Account</h4>
          <ul className="footer-links">
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Create Account</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
          </ul>
        </div>

        {/* Support column */}
        <div className="footer-col">
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Shipping Policy</a></li>
            <li><a href="#">Returns & Refunds</a></li>
            <li><a href="#">Warranty</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {year} VoltStore. All rights reserved.</span>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
          <div className="footer-payments">
            <span className="pay-badge">VISA</span>
            <span className="pay-badge">MC</span>
            <span className="pay-badge">PayPal</span>
            <span className="pay-badge">Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
