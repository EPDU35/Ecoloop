import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT Access Token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle JWT Refresh Token rotation or logout on expiration
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config;
    
    // If unauthorized (401) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Attempt token rotation
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          if (res.status === 200) {
            const { access_token, refresh_token } = res.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            
            // Retry the original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token is also expired or invalid, clear keys and logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/connexion?expired=true';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
