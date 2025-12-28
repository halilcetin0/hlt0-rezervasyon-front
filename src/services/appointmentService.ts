import api from '@/lib/api';
import { ApiResponse, Appointment } from '@/types';

export const appointmentService = {
  getAppointments: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getAppointment: async (id: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (data: {
    businessId: string;
    serviceId: string;
    employeeId: string;
    appointmentDate: string;
    notes?: string;
  }): Promise<ApiResponse<Appointment>> => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  updateAppointment: async (id: string, data: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  cancelAppointment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  getAvailableSlots: async (params: {
    employeeId: string;
    date: string;
    duration: number;
  }): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/appointments/available-slots', { params });
    return response.data;
  },
};


