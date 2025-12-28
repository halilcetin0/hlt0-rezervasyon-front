import api from '@/lib/api';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest } from '@/types';

export const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  resendVerification: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/auth/resend-verification?email=${email}`);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/auth/forgot-password?email=${email}`);
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/auth/reset-password?token=${token}&newPassword=${newPassword}`);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};


