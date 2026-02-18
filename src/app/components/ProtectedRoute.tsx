/**
 * ProtectedRoute - Redirige a /login si no hay sesión
 */

import { Navigate, useLocation } from 'react-router-dom';
import { getInternalJwtToken } from '@shared/infrastructure/http/token.helper';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const token = getInternalJwtToken();

  if (!token) {
    return <Navigate to="/iniciar-sesion" state={{ from: location.pathname, planId: (location.state as { planId?: string })?.planId }} replace />;
  }

  return <>{children}</>;
}
