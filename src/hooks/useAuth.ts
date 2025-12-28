import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout, updateUser } = useAuthStore();
  
  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout,
    updateUser,
  };
}


