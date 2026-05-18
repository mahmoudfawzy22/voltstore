import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/api';
import './AdminOrdersPage.css';

const STATUS_META = {
  pending:    { label: 'Pending',    color: '#F97316', bg: '#FFF7ED' },
  processing: { label: 'Processing', color: '#2563EB', bg: '#EFF6FF' },
  shipped:    { label: 'Shipped',    color: '#8B5CF6', bg: '#F5F3FF' },
  delivered:  { label: 'Delivered',  color: '#22C55E', bg: '#F0FDF4' },
  cancelled:  { label: 'Cancelled',  color: '#EF4444', bg: '#FEF2F2' },
};

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrdersPage = () => {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [filter, setFilter]         = useState('all');
  const [expanded, setExpanded]     = useState(null);
  const [updating, setUpdating]     = useState(null); // orderId being updated
  const [confirmAction, setConfirmAction] = useState(null); // { order, newStatus }

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderService.getAllOrders();
      setOrders(data.orders);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const handleStatusChange = useCallback(async () => {
    if (!confirmAction) return;
    const { order, newStatus } = confirmAction;
    setUpdating(order._id);
    setConfirmAction(null);
    try {
      await orderService.updateStatus(order._id, newStatus);
      setOrders((prev) =>
        prev.map((o) => o._id === order._id ? { ...o, status: newStatus } : o)
      );
      showSuccess(`Order #${order._id.slice(-8).toUpperCase()} marked as "${newStatus}".`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order.');
    } finally {
      setUpdating(null);
    }
  }, [confirmAction]);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="admin-orders-page">
      <div className="container">
        {/* Header */}
        <div className="admin-orders-header">
          <div>
            <h1 className="page-title">Order Management</h1>
            <p className="page-subtitle">{orders.length} total orders</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchOrders}>↻ Refresh</button>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Status filter tabs */}
        <div className="status-tabs">
          <button className={`status-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All <span className="tab-count">{orders.length}</span>
          </button>
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              className={`status-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
              style={filter === s ? { color: STATUS_META[s].color, borderColor: STATUS_META[s].color } : {}}
            >
              {STATUS_META[s].label}
              {counts[s] ? <span className="tab-count">{counts[s]}</span> : null}
            </button>
          ))}
        </div>

        {/* Orders table */}
        {loading ? <div className="spinner" /> : (
          <div className="admin-orders-list">
            {filteredOrders.length === 0 && (
              <div className="empty-orders-admin">No orders found for this filter.</div>
            )}

            {filteredOrders.map((order) => {
              const meta   = STATUS_META[order.status] || STATUS_META.pending;
              const isOpen = expanded === order._id;
              const isUpdating = updating === order._id;

              return (
                <div key={order._id} className="admin-order-card card fade-in">
                  {/* Row summary */}
                  <div
                    className="admin-order-row"
                    onClick={() => setExpanded(isOpen ? null : order._id)}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setExpanded(isOpen ? null : order._id)}
                  >
                    <div className="ao-id-col">
                      <span className="ao-id">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="ao-date">{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="ao-customer-col">
                      <span className="ao-customer-name">{order.user?.name || 'Deleted User'}</span>
                      <span className="ao-customer-email">{order.user?.email}</span>
                    </div>

                    <div className="ao-total-col">
                      <span className="ao-total">${order.totalPrice.toFixed(2)}</span>
                      <span className="ao-items-count">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="ao-status-col" onClick={(e) => e.stopPropagation()}>
                      <span className="ao-status-badge" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>

                    <svg className={`chevron ${isOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="admin-order-details fade-in">
                      {/* Items list */}
                      <div className="ao-items-section">
                        <h4 className="ao-section-title">Order Items</h4>
                        {order.items.map((item, i) => (
                          <div key={i} className="ao-item">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="ao-item-img" />}
                            <div className="ao-item-info">
                              <span className="ao-item-name">{item.name}</span>
                              <span className="ao-item-qty">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                            </div>
                            <span className="ao-item-subtotal">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="ao-total-row">
                          <span>Total</span>
                          <span className="ao-grand-total">${order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Shipping info */}
                      <div className="ao-shipping-section">
                        <h4 className="ao-section-title">Shipping Info</h4>
                        <div className="ao-shipping-info">
                          <div className="ao-shipping-row">
                            <span className="ao-shipping-label">Customer</span>
                            <span>{order.user?.name}</span>
                          </div>
                          <div className="ao-shipping-row">
                            <span className="ao-shipping-label">Email</span>
                            <span>{order.user?.email}</span>
                          </div>
                          <div className="ao-shipping-row">
                            <span className="ao-shipping-label">Address</span>
                            <span>{order.shippingAddress.address}</span>
                          </div>
                          <div className="ao-shipping-row">
                            <span className="ao-shipping-label">Phone</span>
                            <span>{order.shippingAddress.phone}</span>
                          </div>
                        </div>

                        {/* Status control */}
                        <h4 className="ao-section-title" style={{ marginTop: 20 }}>Update Status</h4>
                        <div className="ao-status-controls">
                          {/* Quick action buttons */}
                          {order.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={isUpdating}
                                onClick={() => setConfirmAction({ order, newStatus: 'processing' })}
                              >
                                ✓ Confirm Order
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={isUpdating}
                                onClick={() => setConfirmAction({ order, newStatus: 'cancelled' })}
                              >
                                ✕ Decline Order
                              </button>
                            </>
                          )}

                          {/* Full status dropdown for other states */}
                          {order.status !== 'pending' && order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <div className="ao-status-dropdown-wrap">
                              <label className="ao-status-dropdown-label">Move to:</label>
                              <div className="ao-status-btn-group">
                                {STATUS_FLOW.filter((s) => s !== order.status && s !== 'pending').map((s) => (
                                  <button
                                    key={s}
                                    className="ao-status-opt-btn"
                                    style={{ borderColor: STATUS_META[s].color, color: STATUS_META[s].color }}
                                    disabled={isUpdating}
                                    onClick={() => setConfirmAction({ order, newStatus: s })}
                                  >
                                    {isUpdating ? '…' : STATUS_META[s].label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {(order.status === 'cancelled' || order.status === 'delivered') && (
                            <span className="ao-final-status">
                              {order.status === 'delivered' ? '✅ Order delivered — no further actions.' : '❌ Order cancelled — no further actions.'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Confirm Action Modal ───────────────────────────────── */}
      {confirmAction && (
        <div className="confirm-modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="confirm-modal card fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              {confirmAction.newStatus === 'cancelled' ? '❌' : confirmAction.newStatus === 'processing' ? '✅' : '🔄'}
            </div>
            <h3 className="confirm-modal-title">
              {confirmAction.newStatus === 'cancelled' ? 'Decline Order?' :
               confirmAction.newStatus === 'processing' ? 'Confirm Order?' :
               `Mark as ${STATUS_META[confirmAction.newStatus]?.label}?`}
            </h3>
            <p className="confirm-modal-body">
              {confirmAction.newStatus === 'cancelled'
                ? `Are you sure you want to decline order #${confirmAction.order._id.slice(-8).toUpperCase()} from ${confirmAction.order.user?.name}? Stock will be restored.`
                : confirmAction.newStatus === 'processing'
                ? `Confirm order #${confirmAction.order._id.slice(-8).toUpperCase()} from ${confirmAction.order.user?.name}? This will mark it as processing.`
                : `Update order #${confirmAction.order._id.slice(-8).toUpperCase()} status to "${STATUS_META[confirmAction.newStatus]?.label}"?`}
            </p>
            <div className="confirm-modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
              <button
                className={`btn ${confirmAction.newStatus === 'cancelled' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleStatusChange}
              >
                Yes, {confirmAction.newStatus === 'cancelled' ? 'Decline' : confirmAction.newStatus === 'processing' ? 'Confirm' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
