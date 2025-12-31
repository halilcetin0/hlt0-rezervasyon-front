import api from '@/lib/api';
import { Appointment } from '@/types';

export const appointmentService = {
  getAppointments: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<Appointment[]> => {
    const response = await api.get('/appointments', { params });
    // Interceptor extracts data from ApiResponse, so response.data is already the data
    // Handle pagination if needed
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    // If backend returns paginated response (Spring Boot Page format)
    if (response.data?.content && Array.isArray(response.data.content)) {
      return response.data.content;
    }
    // Fallback to empty array
    return [];
  },

  getAppointment: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (data: {
    businessId: string;
    serviceId: string;
    employeeId: string;
    appointmentDate: string;
    notes?: string;
  }): Promise<Appointment> => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  updateAppointment: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  cancelAppointment: async (id: string): Promise<void> => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  getAvailableSlots: async (params: {
    employeeId: string;
    date: string;
    duration: number;
  }): Promise<string[]> => {
    const response = await api.get('/appointments/available-slots', { params });
    return response.data;
  },

  approveByOwner: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.put(`/appointments/${appointmentId}/approve/owner`);
    return response.data;
  },

  rejectByOwner: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.put(`/appointments/${appointmentId}/reject/owner`);
    return response.data;
  },

  approveByEmployee: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.put(`/appointments/${appointmentId}/approve/employee`);
    return response.data;
  },

  rejectByEmployee: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.put(`/appointments/${appointmentId}/reject/employee`);
    return response.data;
  },
};


