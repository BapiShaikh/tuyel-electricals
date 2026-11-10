import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tuyel_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if 401 is received on protected API calls (not during login itself)
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('tuyel_token');
      localStorage.removeItem('tuyel_user');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
};

// Categories
export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Brands
export const brandAPI = {
  getAll: () => api.get('/brands'),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

// Services
export const serviceAPI = {
  getAll: (params) => api.get('/services', { params }),
  getCategories: () => api.get('/services/categories'),
  getOne: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/services/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/services/${id}`),
};

// Bookings
export const bookingAPI = {
  create: (data) => api.post('/bookings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/bookings', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  track: (bookingId, phone) => api.get(`/bookings/track/${bookingId}`, { params: { phone } }),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/statistics'),
  getRecentOrders: () => api.get('/dashboard/recent-orders'),
  getRecentBookings: () => api.get('/dashboard/recent-bookings'),
  getSales: () => api.get('/dashboard/sales'),
  getPopularProducts: () => api.get('/dashboard/popular-products'),
};

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Settings
export const settingsAPI = {
  getPublic: () => api.get('/settings'),
  getBanners: () => api.get('/banners'),
  getAll: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getInventory: (params) => api.get('/admin/inventory', { params }),
};

export default api;

