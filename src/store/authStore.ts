import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Helper to safely get from localStorage
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage only once
  const storedToken = getStoredToken();
  const storedUser = getStoredUser();
  
  const initialState = {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken && !!storedUser,
  };

  return {
    ...initialState,
    setAuth: (user: User, token: string) => {
      try {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
      set({ user: null, token: null, isAuthenticated: false });
    },
    updateUser: (user: User) => {
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
      set({ user });
    },
  };
});


