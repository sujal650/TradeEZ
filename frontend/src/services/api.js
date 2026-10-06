import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tradeez_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('tradeez_token')) {
        localStorage.removeItem('tradeez_token');
        localStorage.removeItem('tradeez_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  resetBalance: () => api.post('/auth/reset-balance')
};

// Stock Endpoints
export const stockAPI = {
  getAll: (params) => api.get('/stocks', { params }),
  getFeatured: () => api.get('/stocks/featured'),
  getBySymbol: (symbol) => api.get(`/stocks/${symbol}`),
  getMarketOverview: () => api.get('/stocks/market/overview')
};

// Trading Endpoints
export const tradeAPI = {
  executeTrade: (tradeData) => api.post('/trades/execute', tradeData),
  getHistory: (limit) => api.get('/trades/history', { params: { limit } })
};

// Portfolio Endpoints
export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio')
};

// Admin Endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  createStock: (stockData) => api.post('/admin/stocks', stockData),
  updateStock: (id, data) => api.patch(`/admin/stocks/${id}`, data),
  deleteStock: (id) => api.delete(`/admin/stocks/${id}`),
  getTransactions: () => api.get('/admin/transactions'),
  moderateTransaction: (id, status) => api.patch(`/admin/transactions/${id}/moderate`, { status })
};

export default api;
