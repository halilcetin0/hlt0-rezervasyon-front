import api from '@/lib/api';
import { Business } from '@/types';

export const favoriteService = {
  getFavorites: async (): Promise<Business[]> => {
    const response = await api.get('/favorites');
    return response.data;
  },

  addFavorite: async (businessId: string): Promise<void> => {
    const response = await api.post(`/favorites/${businessId}`);
    return response.data;
  },

  removeFavorite: async (businessId: string): Promise<void> => {
    const response = await api.delete(`/favorites/${businessId}`);
    return response.data;
  },

  isFavorite: async (businessId: string): Promise<boolean> => {
    const response = await api.get(`/favorites/${businessId}/check`);
    return response.data;
  },
};

