import api from '@/lib/api';
import { Business, Service, Employee, Review } from '@/types';

export const businessService = {
  getBusinesses: async (params?: {
    name?: string;
    city?: string;
    category?: string;
    businessType?: string;
    page?: number;
    size?: number;
  }): Promise<Business[]> => {
    const response = await api.get('/businesses', { params });
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

  getBusiness: async (id: string): Promise<Business> => {
    const response = await api.get(`/businesses/${id}`);
    return response.data;
  },

  updateBusiness: async (id: string, data: Partial<Business>): Promise<Business> => {
    const response = await api.put(`/businesses/${id}`, data);
    return response.data;
  },

  getBusinessServices: async (businessId: string): Promise<Service[]> => {
    const response = await api.get(`/businesses/${businessId}/services`);
    // Handle pagination if needed
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.content) {
      return response.data.content;
    }
    return response.data || [];
  },

  getBusinessEmployees: async (businessId: string): Promise<Employee[]> => {
    const response = await api.get(`/businesses/${businessId}/employees`);
    // Handle pagination if needed
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.content) {
      return response.data.content;
    }
    return response.data || [];
  },

  getBusinessReviews: async (businessId: string): Promise<Review[]> => {
    const response = await api.get(`/businesses/${businessId}/reviews`);
    // Handle pagination if needed
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.content) {
      return response.data.content;
    }
    return response.data || [];
  },

  getMyBusiness: async (): Promise<Business> => {
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
  }): Promise<Business> => {
    const response = await api.post('/businesses', data);
    return response.data;
  },
};


