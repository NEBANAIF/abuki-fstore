/**
 * ─────────────────────────────────────────────────────────────────────────
 *  api.js — Central Axios service with JWT auth and role-aware endpoints
 *
 *  Key additions for role-based auth:
 *    - getSalesToday() → calls /api/sales/today (worker + admin)
 *    - getSales()      → calls /api/sales (admin only; 403 for workers)
 *
 *  The frontend decides which to call based on user.role stored in localStorage.
 * ─────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://abuki-storeb.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT + session-health management (request + response interceptors below) ──
//
// WHY the debounce:
//   The backend runs on Render free tier and cold-starts after ~15 min idle.
//   Right after login, several requests fire at once (Dashboard, Sales, etc.).
//   If the backend isn't fully up yet, those requests can return 401 before the
//   token is ever invalid — causing an immediate logout loop.
//
//   The debounce waits 4 s before actually wiping the session. If the backend
//   wakes up within that window the subsequent retries will succeed and the
//   timer gets cancelled. A genuinely expired / invalid token will still
//   produce a consistent 401 on every request, so the logout fires after 4 s.
//
let _logoutTimer = null;

function scheduleLogout() {
  if (_logoutTimer) return; // already scheduled
  _logoutTimer = setTimeout(() => {
    _logoutTimer = null;
    // Double-check: if token is still present it means no successful request
    // cancelled the timer → session really is invalid → log out.
    if (localStorage.getItem('abuki_token')) {
      localStorage.removeItem('abuki_token');
      localStorage.removeItem('abuki_user');
      if (!window.location.pathname.includes('login')) window.location.href = '/';
    }
  }, 4000);
}

function cancelLogout() {
  if (_logoutTimer) {
    clearTimeout(_logoutTimer);
    _logoutTimer = null;
  }
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('abuki_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    cancelLogout(); // a new request with a valid token means session is alive
  }
  return config;
});

api.interceptors.response.use(
  res => {
    cancelLogout(); // successful response → session is fine, cancel any pending logout
    return res;
  },
  err => {
    if (err.response?.status === 401) {
      scheduleLogout(); // debounced — won't fire immediately
    }
    // Extract the best error message from response body
    const data = err.response?.data;
    const msg = (data && typeof data === 'object' && data.error) ? data.error
      : typeof data === 'string' ? data
      : err.message || 'Error';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
  }
);

// ── AUTH ───────────────────────────────────────────────────────────────────
export const login  = (email, password, deviceFingerprint) =>
  api.post('/auth/login', { email, password, deviceFingerprint }).then(r => r.data);
export const getMe  = () => api.get('/auth/me').then(r => r.data);

// ── USERS (ADMIN only — returns 403 for WORKER) ───────────────────────────
export const getUsers    = ()         => api.get('/users').then(r => r.data);
export const createUser  = (data)     => api.post('/users', data).then(r => r.data);
export const updateUser  = (id, data) => api.put(`/users/${id}`, data).then(r => r.data);
export const deleteUser  = (id)       => api.delete(`/users/${id}`).then(r => r.data);

// ── LOGIN HISTORY (ADMIN only — device/IP audit trail, read-only) ────────
export const getLoginHistory = () => api.get('/login-history').then(r => r.data);

// ── DEVICES (ADMIN only — rename / block / unblock specific devices) ─────
export const getDevices   = ()         => api.get('/devices').then(r => r.data);
export const updateDevice = (id, data) => api.put(`/devices/${id}`, data).then(r => r.data);

// ── PRODUCTS ───────────────────────────────────────────────────────────────
// GET endpoints are allowed for both ADMIN and WORKER
// POST/PUT/DELETE endpoints return 403 for WORKER
export const getProducts    = ()           => api.get('/products').then(r => r.data);
export const getProductById = (id)         => api.get(`/products/${id}`).then(r => r.data);
export const searchProducts = (keyword)    => api.get(`/products/search?keyword=${encodeURIComponent(keyword)}`).then(r => r.data);
export const getLowStock    = ()           => api.get('/products/low-stock').then(r => r.data);
export const getOutOfStock  = ()           => api.get('/products/out-of-stock').then(r => r.data);
export const createProduct  = (data)       => api.post('/products', data).then(r => r.data);
export const updateProduct  = (id, data)   => api.put(`/products/${id}`, data).then(r => r.data);
export const deleteProduct  = (id)         => api.delete(`/products/${id}`).then(r => r.data);
export const adjustStock    = (id, qty, reason = 'Stock adjustment', user = 'Admin') =>
  api.post(`/products/${id}/adjust-stock`, null, { params: { quantity: qty, reason, user } }).then(r => r.data);
export const addStock = adjustStock;

// ── SALES ──────────────────────────────────────────────────────────────────
// getSales()      → ADMIN only (all historical sales)
// getSalesToday() → ADMIN + WORKER (today's sales only)
// recordSale()    → ADMIN + WORKER (create new sale)
// updateSalePayment() → ADMIN + WORKER (record a loan payment)
// deleteSale()    → ADMIN only (returns 403 for WORKER)
export const getSales      = ()     => api.get('/sales').then(r => r.data);
export const getSalesToday = ()     => api.get('/sales/today').then(r => r.data);
export const getSaleById   = (id)   => api.get(`/sales/${id}`).then(r => r.data);
export const recordSale    = (data) => api.post('/sales', data).then(r => r.data);
export const updateSalePayment = (id, paidAmount) =>
  api.put(`/sales/${id}/payment`, { paidAmount }).then(r => r.data);
export const deleteSale    = (id)   => api.delete(`/sales/${id}`).then(r => r.data);

// ── STOCK HISTORY (ADMIN only — returns 403 for WORKER) ───────────────────
export const getStockHistory          = ()   => api.get('/stock-history').then(r => r.data);
export const getStockHistoryByProduct = (id) => api.get(`/stock-history/product/${id}`).then(r => r.data);
export const deleteStockHistory       = (id) => api.delete(`/stock-history/${id}`).then(r => r.data);

export const stockHistoryAPI = {
  getAll:  getStockHistory,
  delete:  deleteStockHistory,
};

export default api;
