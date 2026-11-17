import axios from 'axios';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) return '/api';
  const clean = url.trim().replace(/\/+$/, '');
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return `${clean}/api`;
  }
  return `https://${clean}/api`;
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
