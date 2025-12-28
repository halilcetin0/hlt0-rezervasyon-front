import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isAuthenticated, token } = useAuth();
  
  // Check if user is authenticated (check both state and localStorage as fallback)
  const tokenFromStorage = localStorage.getItem('accessToken');
  const userFromStorage = localStorage.getItem('user');
  const isAuth = isAuthenticated || (!!tokenFromStorage && !!userFromStorage);
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  // Get user from state or localStorage
  const currentUser = user || (userFromStorage ? JSON.parse(userFromStorage) : null);
  
  if (roles && currentUser && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}


