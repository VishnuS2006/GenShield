import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // If we are not already on the login or register page, we can clear token
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/login') || error.config?.url?.includes('/api/auth/register');
      if (!isAuthEndpoint) {
        storage.clearAuth();
        // Optional redirect or trigger state update
      }
    }
    return Promise.reject(error);
  }
);

export async function checkHealth(): Promise<{ status: string; database: string; service: string }> {
  const response = await apiClient.get('/health');
  return response.data;
}
