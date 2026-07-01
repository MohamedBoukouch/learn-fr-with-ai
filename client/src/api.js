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
    const requestUrl = error.config?.url || '';
    const isChatRequest = requestUrl.includes('/student/chat');
    const isQuizRequest = requestUrl.includes('/admin/stats');
    const isPublicRequest = ['/auth/signin', '/auth/signup', '/admin/settings/general'].some((endpoint) =>
      requestUrl.includes(endpoint)
    );
    const is401or403 = error.response?.status === 401 || error.response?.status === 403;

    if (is401or403 && !isChatRequest && !isQuizRequest && !isPublicRequest) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
