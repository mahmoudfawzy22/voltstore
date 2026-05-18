import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { orderService } from '../services/api';
import './OrdersPage.css';

const STATUS_META = {
  pending:    { label: 'Pending',    color: '#F97316' },
  processing: { label: 'Processing', color: '#2563EB' },
  shipped:    { label: 'Shipped',    color: '#8B5CF6' },
  delivered:  { label: 'Delivered',  color: '#22C55E' },
  cancelled:  { label: 'Cancelled',  color: '#EF4444' },
};

const OrdersPage = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [expanded, setExpanded]       = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null); // order to cancel
  const [cancelling, setCancelling]   = useState(false);
  const [cancelError, setCancelError] = useState('');
  const location = useLocation();
  const orderSuccess = location.state?.orderSuccess;

  useEffect(() => {
    orderService.getUserOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setError('Failed to load orders. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelConfirm = async () => {
    if (!confirmCancel) return;
    setCancelling(true);
    setCancelError('');
    try {
      const { data } = await orderService.cancel(confirmCancel._id);
      setOrders((prev) => prev.map((o) => o._id === confirmCancel._id ? { ...o, status: 'cancelled' } : o));
      setConfirmCancel(null);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (loading) return <div className="orders-page"><div className="container"><div className="spinner" /></div></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: 8 }}>My Orders</h1>
        <p className="page-subtitle" style={{ marginBottom: 32 }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </p>

        {orderSuccess && (
          <div className="alert alert-success" style={{ marginBottom: 24 }}>
            🎉 Your order has been placed successfully! We'll process it shortly.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>When you place orders, they'll appear here.</p>
            <Link to="/" className="btn btn-primary">Start Shopping</Link>
          </div>
        )}

        <div className="orders-list">
          {orders.map((order) => {
            const status = STATUS_META[order.status] || STATUS_META.pending;
            const isOpen = expanded === order._id;
            const canCancel = order.status === 'pending';

            return (
              <div key={order._id} className="order-card card fade-in">
                {/* Order header */}
                <div
                  className="order-header"
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setExpanded(isOpen ? null : order._id)}
                >
                  <div className="order-meta">
                    <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-summary-right">
                    <span className="status-badge" style={{ background: status.color + '18', color: status.color }}>
                      {status.label}
                    </span>
                    <span className="order-total">${order.totalPrice.toFixed(2)}</span>
                    <svg className={`chevron ${isOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div className="order-details fade-in">
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="order-item-img" />}
                          <div className="order-item-info">
                            <span className="order-item-name">{item.name}</span>
                            <span className="order-item-qty">Qty: {item.quantity}</span>
                          </div>
                          <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}

                      {/* Cancel button inside details */}
                      {canCancel && (
                        <div className="cancel-row">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => { e.stopPropagation(); setConfirmCancel(order); setCancelError(''); }}
                          >
                            ✕ Cancel Order
                          </button>
                          <span className="cancel-hint">Only pending orders can be cancelled</span>
                        </div>
                      )}
                    </div>

                    <div className="order-shipping">
                      <span className="shipping-label">📍 Delivery Address</span>
                      <span className="shipping-value">{order.shippingAddress.address}</span>
                      <span className="shipping-label" style={{ marginTop: 6 }}>📞 Phone</span>
                      <span className="shipping-value">{order.shippingAddress.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cancel Confirmation Modal ──────────────────────────── */}
      {confirmCancel && (
        <div className="cancel-modal-overlay" onClick={() => { setConfirmCancel(null); setCancelError(''); }}>
          <div className="cancel-modal card fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-icon">⚠️</div>
            <h3 className="cancel-modal-title">Cancel Order?</h3>
            <p className="cancel-modal-body">
              Are you sure you want to cancel order <strong>#{confirmCancel._id.slice(-8).toUpperCase()}</strong>?
              <br />This action cannot be undone.
            </p>
            {cancelError && <div className="alert alert-error" style={{ textAlign: 'left' }}>{cancelError}</div>}
            <div className="cancel-modal-actions">
              <button className="btn btn-secondary" onClick={() => { setConfirmCancel(null); setCancelError(''); }} disabled={cancelling}>
                Keep Order
              </button>
              <button className="btn btn-danger" onClick={handleCancelConfirm} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
