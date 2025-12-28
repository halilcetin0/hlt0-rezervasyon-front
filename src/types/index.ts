export type UserRole = 'CUSTOMER' | 'BUSINESS_OWNER' | 'STAFF';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
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
  id: string;
  customerId: string;
  businessId: string;
  serviceId: string;
  employeeId: string;
  appointmentDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
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
  businessId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  customer?: User;
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
  token: string;
  user: User;
}


