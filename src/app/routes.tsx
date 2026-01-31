import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardPage } from '@app/pages/dashboard/DashboardPage';
import { HomePage } from '@app/pages/home/HomePage';
import { SucursalVirtualPage } from '@app/pages/sucursal-virtual/SucursalVirtualPage';
import { PlanesyCoberturasPage } from '@app/pages/planes-y-coberturas/PlanesyCoberturasPage';
import { ContratacionPage } from '@app/pages/contratacion/ContratacionPage';
import { LoginPage } from '@app/pages/login/LoginPage';
import { RegisterPage } from '@app/pages/register/RegisterPage';
import { NotFoundPage } from '@app/pages/NotFoundPage';
import { ReclamosPage } from '@app/pages/reclamos/ReclamosPage';
import { ChatPage } from '@app/pages/chat/ChatPage';
import { NotificacionesPage } from '@app/pages/notificaciones/NotificacionesPage';
import { AdminDashboardPage } from '@app/pages/admin/AdminDashboardPage';
import { AdminPlansPage } from '@app/pages/admin/AdminPlansPage';
import { AdminUsersPage } from '@app/pages/admin/AdminUsersPage';
import { AdminCouponsPage } from '@app/pages/admin/AdminCouponsPage';
import { AdminClaimsPage } from '@app/pages/admin/AdminClaimsPage';
import { AdminEnterprisesPage } from '@app/pages/admin/AdminEnterprisesPage';
import { AdminIndicatorsPage } from '@app/pages/admin/AdminIndicatorsPage';
import { ProtectedRoute } from '@app/components/ProtectedRoute';
import { AdminProtectedRoute } from '@app/components/AdminProtectedRoute';
import { AdminLayout } from '@app/components/AdminLayout';
import { ErrorBoundary } from '@app/components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" replace />,
    errorElement: <ErrorBoundary />,
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
    path: '/reclamos',
    element: (
      <ProtectedRoute>
        <ReclamosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sucursal-virtual/notificaciones',
    element: (
      <ProtectedRoute>
        <NotificacionesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'planes', element: <AdminPlansPage /> },
      { path: 'usuarios', element: <AdminUsersPage /> },
      { path: 'cupones', element: <AdminCouponsPage /> },
      { path: 'reclamos', element: <AdminClaimsPage /> },
      { path: 'empresas', element: <AdminEnterprisesPage /> },
      { path: 'indicadores', element: <AdminIndicatorsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <ErrorBoundary />,
  },
]);
