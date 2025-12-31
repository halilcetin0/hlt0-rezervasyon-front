import api from '@/lib/api';
import { Service } from '@/types';

export const serviceService = {
  getServices: async (businessId: string): Promise<Service[]> => {
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

  createService: async (businessId: string, data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
  }): Promise<Service> => {
    const response = await api.post(`/businesses/${businessId}/services`, data);
    return response.data;
  },

  updateService: async (businessId: string, serviceId: string, data: Partial<Service>): Promise<Service> => {
    const response = await api.put(`/businesses/${businessId}/services/${serviceId}`, data);
    return response.data;
  },

  deleteService: async (businessId: string, serviceId: string): Promise<void> => {
    const response = await api.delete(`/businesses/${businessId}/services/${serviceId}`);
    return response.data;
  },
};

