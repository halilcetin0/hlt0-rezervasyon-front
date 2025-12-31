export type UserRole = 'CUSTOMER' | 'BUSINESS_OWNER' | 'STAFF';

export interface User {
  id: string | number;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: 'CUSTOMER' | 'BUSINESS_OWNER' | 'STAFF';
  emailVerified: boolean;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  category: string;
  businessType: string;
  phone: string;
  email: string;
  imageUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  businessId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string | number;
  customerId: string | number;
  businessId: string | number;
  serviceId: string | number;
  employeeId: string | number;
  appointmentDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  ownerApproved?: boolean | null;
  employeeApproved?: boolean | null;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  business?: Business;
  service?: Service;
  employee?: Employee;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  customerId: string;
  customerName?: string;
  businessId: string;
  employeeId?: string;
  employeeName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  customer?: User;
}

export interface ReviewRequest {
  appointmentId: number;
  rating: number; // 1-5
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  appointmentId: number;
  customerId: number;
  customerName: string;
  businessId: number;
  employeeId?: number;
  employeeName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'CUSTOMER' | 'BUSINESS_OWNER';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}


