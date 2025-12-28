import api from '@/lib/api';
import { ApiResponse, Employee } from '@/types';

export const employeeService = {
  getEmployees: async (businessId: string): Promise<ApiResponse<Employee[]>> => {
    const response = await api.get(`/businesses/${businessId}/employees`);
    return response.data;
  },

  createEmployee: async (businessId: string, data: {
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
  }): Promise<ApiResponse<Employee>> => {
    const response = await api.post(`/businesses/${businessId}/employees`, data);
    return response.data;
  },

  updateEmployee: async (businessId: string, employeeId: string, data: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    const response = await api.put(`/businesses/${businessId}/employees/${employeeId}`, data);
    return response.data;
  },

  deleteEmployee: async (businessId: string, employeeId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/businesses/${businessId}/employees/${employeeId}`);
    return response.data;
  },

  updateSchedule: async (businessId: string, employeeId: string, schedules: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[]): Promise<ApiResponse<any>> => {
    const response = await api.post(`/businesses/${businessId}/employees/${employeeId}/schedule`, { schedules });
    return response.data;
  },

  getSchedule: async (businessId: string, employeeId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/businesses/${businessId}/employees/${employeeId}/schedule`);
    return response.data;
  },
};

