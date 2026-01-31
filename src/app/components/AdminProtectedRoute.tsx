/**
 * AdminProtectedRoute - Redirige a /home si no hay sesión o el usuario no es ADMIN
 */

import { Navigate, useLocation } from 'react-router-dom';
import { getInternalJwtToken } from '@shared/infrastructure/http/token.helper';
import { authStore } from '@shared/infrastructure/auth/auth.store';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const location = useLocation();
  const token = getInternalJwtToken();
  const user = authStore.user;

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
