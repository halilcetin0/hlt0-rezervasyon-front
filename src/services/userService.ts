import api from '@/lib/api';
import { User } from '@/types';

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
  }): Promise<User> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    const response = await api.put('/users/me/password', data);
    return response.data;
  },
};

