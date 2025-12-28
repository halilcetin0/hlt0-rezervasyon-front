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

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage
  const storedToken = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('user');
  
  const initialState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!storedToken && !!storedUser,
  };

  return {
    ...initialState,
    setAuth: (user: User, token: string) => {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },
    updateUser: (user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    },
  };
});


