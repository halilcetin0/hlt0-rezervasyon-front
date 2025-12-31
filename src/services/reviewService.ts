import api from '@/lib/api';
import { Review } from '@/types';

export const reviewService = {
  createReview: async (data: {
    appointmentId: string | number;
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  updateReview: async (id: string, data: {
    rating?: number;
    comment?: string;
  }): Promise<Review> => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  getUserReviews: async (): Promise<Review[]> => {
    const response = await api.get('/reviews/me');
    return response.data;
  },

  getBusinessReviews: async (businessId: string): Promise<Review[]> => {
    const response = await api.get(`/businesses/${businessId}/reviews`);
    // Handle pagination if needed
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    // If backend returns paginated response
    if (response.data?.content) {
      return response.data.content;
    }
    return response.data || [];
  },
};

