import axios from 'axios';

export const API_BASE_URL = `http://${window.location.hostname}:8080`;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isChatRequest = error.config?.url?.includes('/student/chat');
    if (error.response?.status === 401 || (error.response?.status === 403 && !isChatRequest)) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
