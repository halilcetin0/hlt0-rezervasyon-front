import api from '@/lib/api';
import { ApiResponse, Business } from '@/types';

export const businessService = {
  getBusinesses: async (params?: {
    name?: string;
    city?: string;
    category?: string;
    businessType?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<Business[]>> => {
    const response = await api.get('/businesses', { params });
    return response.data;
  },

  getBusiness: async (id: string): Promise<ApiResponse<Business>> => {
    const response = await api.get(`/businesses/${id}`);
    return response.data;
  },

  updateBusiness: async (id: string, data: Partial<Business>): Promise<ApiResponse<Business>> => {
    const response = await api.put(`/businesses/${id}`, data);
    return response.data;
  },

  getBusinessServices: async (businessId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/businesses/${businessId}/services`);
    return response.data;
  },

  getBusinessEmployees: async (businessId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/businesses/${businessId}/employees`);
    return response.data;
  },

  getBusinessReviews: async (businessId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/businesses/${businessId}/reviews`);
    return response.data;
  },

  getMyBusiness: async (): Promise<ApiResponse<Business>> => {
    const response = await api.get('/businesses/me');
    return response.data;
  },

  createBusiness: async (data: {
    name: string;
    description?: string;
    category: string;
    address: string;
    city: string;
    businessType: string;
    phone: string;
    email: string;
    imageUrl?: string;
  }): Promise<ApiResponse<Business>> => {
    const response = await api.post('/businesses', data);
    return response.data;
  },
};


