import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && (envUrl.includes('.') || envUrl.startsWith('http'))) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.startsWith('http') ? `${clean}/api` : `https://${clean}/api`;
  }
  return 'https://opd-backend-09yq.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('opd_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
