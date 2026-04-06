import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finance_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Return the full response so callers can access .data.data
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network error — backend unreachable
      toast.error('Cannot connect to server. Is the backend running?');
      return Promise.reject(error);
    }

    const status = error.response.status;
    const errorCode = error.response.data?.error;
    const message = error.response.data?.message;

    if (status === 401) {
      // Only auto-logout if it's not the login endpoint
      const isLoginEndpoint = error.config.url?.includes('/auth/login');
      if (!isLoginEndpoint) {
        localStorage.removeItem('finance_token');
        localStorage.removeItem('finance_user');
        window.location.href = '/login';
        toast.error('Session expired. Please log in again.');
      }
      // For login endpoint: let the error bubble up to the form
    }

    if (status === 403 && !error.config.url?.includes('/auth/')) {
      window.location.href = '/unauthorized';
    }

    if (status === 404) {
      toast.error(message || 'The requested resource was not found');
    }

    if (status === 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject({
      status,
      errorCode,
      message,
      details: error.response.data?.details,
    });
  }
);

export default api;
