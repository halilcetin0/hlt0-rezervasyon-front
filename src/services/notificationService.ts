import api from '@/lib/api';
import { ApiResponse, Notification } from '@/types';

export const notificationService = {
  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  getNotifications: async (params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};


