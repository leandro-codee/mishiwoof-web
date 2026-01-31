import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardPage } from '@app/pages/dashboard/DashboardPage';
import { HomePage } from '@app/pages/home/HomePage';
import { SucursalVirtualPage } from '@app/pages/sucursal-virtual/SucursalVirtualPage';
import { PlanesyCoberturasPage } from '@app/pages/planes-y-coberturas/PlanesyCoberturasPage';
import { ContratacionPage } from '@app/pages/contratacion/ContratacionPage';
import { LoginPage } from '@app/pages/login/LoginPage';
import { RegisterPage } from '@app/pages/register/RegisterPage';
import { NotFoundPage } from '@app/pages/NotFoundPage';
import { ProtectedRoute } from '@app/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sucursal-virtual',
    element: (
      <ProtectedRoute>
        <SucursalVirtualPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/planes-y-coberturas',
    element: <PlanesyCoberturasPage />,
  },
  {
    path: '/contratacion',
    element: (
      <ProtectedRoute>
        <ContratacionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
