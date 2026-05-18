import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear stale auth data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Products ─────────────────────────────────────────────────
export const productService = {
  getAll: (search = '') => api.get('/products', { params: search ? { search } : {} }),
  getById: (id) => api.get(`/products/${id}`),
};

// ─── Cart ─────────────────────────────────────────────────────
export const cartService = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart'),
};

// ─── Orders ───────────────────────────────────────────────────
export const orderService = {
  create:        (data) => api.post('/orders', data),
  getUserOrders: ()     => api.get('/orders/user'),
  cancel:        (id)   => api.patch(`/orders/${id}/cancel`),
  // Admin
  getAllOrders:   ()              => api.get('/orders/admin/all'),
  updateStatus:  (id, status)    => api.patch(`/orders/admin/${id}/status`, { status }),
};

// ─── Admin ────────────────────────────────────────────────────
export const adminService = {
  getProducts: ()           => api.get('/admin/products'),
  createProduct: (data)     => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id)       => api.delete(`/admin/products/${id}`),
};

// ─── Chat ─────────────────────────────────────────────────────
export const chatService = {
  getMy:   ()   => api.get('/chat/my'),
  getAll:  ()   => api.get('/chat/all'),
  getOne:  (id) => api.get(`/chat/${id}`),
  resolve: (id) => api.patch(`/chat/${id}/resolve`),
  delete:  (id) => api.delete(`/chat/${id}`),
};

export default api;
