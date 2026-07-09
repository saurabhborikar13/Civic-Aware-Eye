import axios from 'axios';

// In dev, Vite proxies /api and /uploads to http://localhost:5000 (see vite.config.js).
// In production, set VITE_API_URL to your backend's base URL, or leave empty to use
// same-origin requests (e.g. when the backend serves this built app itself).
const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
    }
    return Promise.reject(err);
  }
);

export const uploadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${baseURL}${path}`;
};

export default api;
