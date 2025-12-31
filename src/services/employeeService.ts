import api from '@/lib/api';
import { Employee } from '@/types';

export const employeeService = {
  getEmployees: async (businessId: string): Promise<Employee[]> => {
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

  createEmployee: async (businessId: string, data: {
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
  }): Promise<Employee> => {
    const response = await api.post(`/businesses/${businessId}/employees`, data);
    return response.data;
  },

  updateEmployee: async (businessId: string, employeeId: string, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.put(`/businesses/${businessId}/employees/${employeeId}`, data);
    return response.data;
  },

  deleteEmployee: async (businessId: string, employeeId: string): Promise<void> => {
    const response = await api.delete(`/businesses/${businessId}/employees/${employeeId}`);
    return response.data;
  },

  updateSchedule: async (businessId: string, employeeId: string, schedules: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[]): Promise<any> => {
    const response = await api.post(`/businesses/${businessId}/employees/${employeeId}/schedule`, { schedules });
    return response.data;
  },

  getSchedule: async (businessId: string, employeeId: string): Promise<any> => {
    const response = await api.get(`/businesses/${businessId}/employees/${employeeId}/schedule`);
    return response.data;
  },

  acceptInvitation: async (token: string): Promise<any> => {
    const response = await api.post(`/employees/accept-invitation?token=${token}`);
    return response.data;
  },
};

