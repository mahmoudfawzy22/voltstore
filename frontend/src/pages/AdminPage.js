import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import './AdminPage.css';

const EMPTY_FORM = { name: '', description: '', price: '', imageUrl: '', stock: '' };

const AdminPage = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null = create mode
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getProducts();
      setProducts(data.products);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // ── Open modal ────────────────────────────────────────────────
  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setError('');
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name:        product.name,
      description: product.description,
      price:       product.price,
      imageUrl:    product.imageUrl,
      stock:       product.stock,
    });
    setFormErrors({});
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setError('');
  };

  // ── Validate ──────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())        errs.name        = 'Name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0)
      errs.price = 'Valid price required';
    if (!form.imageUrl.trim())    errs.imageUrl    = 'Image URL is required';
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0)
      errs.stock = 'Valid stock quantity required';
    return errs;
  };

  // ── Save (create or update) ───────────────────────────────────
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      };

      if (editProduct) {
        await adminService.updateProduct(editProduct._id, payload);
        showSuccess('Product updated successfully.');
      } else {
        await adminService.createProduct(payload);
        showSuccess('Product created successfully.');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await adminService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showSuccess('Product deleted.');
    } catch {
      setError('Failed to delete product.');
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">{products.length} products in catalog</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>

        {/* Alerts */}
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Products table */}
        {loading ? <div className="spinner" /> : (
          <div className="admin-table-wrap card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan={4} className="table-empty">No products yet. Add one!</td></tr>
                )}
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="table-product">
                        <img src={product.imageUrl} alt={product.name} className="table-img" />
                        <div>
                          <div className="table-name">{product.name}</div>
                          <div className="table-desc">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-price">${product.price.toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : 'ok'}`}>
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(product)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirmDelete(product)}
                          disabled={deleting === product._id}
                        >
                          {deleting === product._id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Product Modal ─────────────────────────────────────── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal card fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="modal-body">
              {/* Image preview */}
              {form.imageUrl && (
                <div className="image-preview">
                  <img src={form.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}

              <div className="form-group">
                <label>Product Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Wireless Headphones" className={formErrors.name ? 'input-error' : ''} />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Product description…" className={formErrors.description ? 'input-error' : ''} style={{ resize: 'vertical' }} />
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" className={formErrors.price ? 'input-error' : ''} />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0" className={formErrors.stock ? 'input-error' : ''} />
                  {formErrors.stock && <span className="error-text">{formErrors.stock}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/…" className={formErrors.imageUrl ? 'input-error' : ''} />
                {formErrors.imageUrl && <span className="error-text">{formErrors.imageUrl}</span>}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal-sm card fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Product</h2>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>? This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete._id)} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
