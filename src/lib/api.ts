import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API Base URL:', baseURL);
}

const api = axios.create({
  baseURL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor: add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle ApiResponse format and 401 (logout)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if response is in ApiResponse format
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data &&
      'message' in response.data
    ) {
      // ApiResponse format
      if (response.data.success) {
        // Return only the data part, but keep the structure for backward compatibility
        return {
          ...response,
          data: response.data.data,
          // Keep original response for services that need it
          originalData: response.data,
        } as AxiosResponse;
      } else {
        // Error in ApiResponse format
        const error = new Error(response.data.message || 'Bir hata oluştu');
        (error as any).response = response;
        return Promise.reject(error);
      }
    }
    // Backward compatibility: return response as is if not ApiResponse format
    return response;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle ApiResponse error format
    if (error.response?.data) {
      const apiError = error.response.data;
      if (typeof apiError === 'object' && 'message' in apiError) {
        const errorMessage = apiError.message || error.message || 'Bir hata oluştu';
        const customError = new Error(errorMessage);
        (customError as any).response = error.response;
        return Promise.reject(customError);
      }
    }

    // Fallback to original error
    return Promise.reject(error);
  }
);

export default api;

