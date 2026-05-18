import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';
import './CartPage.css';

const CartPage = () => {
  const { cart, loading, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Checkout form state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm]     = useState({ address: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing]   = useState(false);
  const [orderError, setOrderError] = useState('');

  const validateCheckout = () => {
    const errs = {};
    if (!form.address.trim()) errs.address = 'Delivery address is required';
    if (!form.phone.trim())   errs.phone   = 'Phone number is required';
    else if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) errs.phone = 'Enter a valid phone number';
    return errs;
  };

  const handlePlaceOrder = async () => {
    const errs = validateCheckout();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setPlacing(true);
    setOrderError('');

    try {
      await orderService.create({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          address: form.address.trim(),
          phone: form.phone.trim(),
        },
      });

      await clearCart();
      navigate('/orders', { state: { orderSuccess: true } });
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  /* ── Empty cart ─────────────────────────────────────────────── */
  if (!loading && cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <Link to="/" className="btn btn-primary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: 8 }}>Shopping Cart</h1>
        <p className="page-subtitle" style={{ marginBottom: 32 }}>
          {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
        </p>

        <div className="cart-layout">
          {/* ── Cart items ─────────────────────────────────────── */}
          <div className="cart-items">
            {loading && <div className="spinner" />}
            {cart.map((item) => (
              <div key={item.productId} className="cart-item card fade-in">
                <img src={item.imageUrl} alt={item.name} className="cart-item-img" />

                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <span className="cart-item-price">${item.price.toFixed(2)} each</span>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}
                    >−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={loading || item.quantity >= item.stock}
                    >+</button>
                  </div>

                  <span className="cart-item-subtotal">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.productId)}
                    disabled={loading}
                    title="Remove item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order summary + checkout ───────────────────────── */}
          <div className="cart-summary card">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-rows">
              {cart.map((item) => (
                <div className="summary-row" key={item.productId}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>
              <span className="total-amount">${totalPrice.toFixed(2)}</span>
            </div>

            {!checkoutOpen ? (
              <button
                className="btn btn-primary btn-full"
                style={{ marginTop: 20 }}
                onClick={() => setCheckoutOpen(true)}
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="checkout-form">
                <h3 className="checkout-heading">Delivery Details</h3>

                {orderError && <div className="alert alert-error">{orderError}</div>}

                <div className="form-group">
                  <label>Delivery Address</label>
                  <textarea
                    rows={3}
                    placeholder="Street, City, ZIP Code, Country"
                    value={form.address}
                    onChange={(e) => { setForm({ ...form, address: e.target.value }); setErrors({ ...errors, address: '' }); }}
                    className={errors.address ? 'input-error' : ''}
                    style={{ resize: 'vertical' }}
                  />
                  {errors.address && <span className="error-text">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={form.phone}
                    onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                    className={errors.phone ? 'input-error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <button
                  className="btn btn-primary btn-full"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                >
                  {placing ? 'Placing Order…' : `Place Order — $${totalPrice.toFixed(2)}`}
                </button>

                <button
                  className="btn btn-secondary btn-full"
                  style={{ marginTop: 8 }}
                  onClick={() => { setCheckoutOpen(false); setErrors({}); setOrderError(''); }}
                >
                  Back to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
