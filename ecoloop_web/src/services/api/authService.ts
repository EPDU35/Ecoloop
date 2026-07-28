import { apiClient } from './client';
import type { User } from '@/types';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token, refresh_token } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  register: async (data: { full_name: string; email: string; phone: string; password: string; role: string }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data; // Returns user info, NOT tokens
  },

  verifyOtp: async (email: string, code: string) => {
    const response = await apiClient.post('/auth/verify-otp', { email, code });
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post('/auth/password-reset/request', { email });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
};
