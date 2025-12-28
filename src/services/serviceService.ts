import api from '@/lib/api';
import { ApiResponse, Service } from '@/types';

export const serviceService = {
  getServices: async (businessId: string): Promise<ApiResponse<Service[]>> => {
    const response = await api.get(`/businesses/${businessId}/services`);
    return response.data;
  },

  createService: async (businessId: string, data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
  }): Promise<ApiResponse<Service>> => {
    const response = await api.post(`/businesses/${businessId}/services`, data);
    return response.data;
  },

  updateService: async (businessId: string, serviceId: string, data: Partial<Service>): Promise<ApiResponse<Service>> => {
    const response = await api.put(`/businesses/${businessId}/services/${serviceId}`, data);
    return response.data;
  },

  deleteService: async (businessId: string, serviceId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/businesses/${businessId}/services/${serviceId}`);
    return response.data;
  },
};

