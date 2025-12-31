import api from '@/lib/api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

export const authService = {
  register: async (data: RegisterRequest): Promise<void> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    // Interceptor extracts data, so response.data is already LoginResponse
    return response.data;
  },

  verifyEmail: async (token: string): Promise<void> => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  resendVerification: async (email: string): Promise<void> => {
    const response = await api.post(`/auth/resend-verification?email=${email}`);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    const response = await api.post(`/auth/forgot-password?email=${email}`);
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const response = await api.post(`/auth/reset-password?token=${token}&newPassword=${newPassword}`);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    // Interceptor extracts data, so response.data is already User
    return response.data;
  },
};


