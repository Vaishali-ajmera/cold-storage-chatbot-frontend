import axios from 'axios';
import { getAccessToken, clearTokens } from '../utils/localStorage';

export const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 Unauthorized or 403 Forbidden, redirect to login page
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
