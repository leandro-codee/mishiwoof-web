import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardPage } from '@app/pages/dashboard/DashboardPage';
import { HomePage } from '@app/pages/home/HomePage';
import { SucursalVirtualPage } from '@app/pages/sucursal-virtual/SucursalVirtualPage';
import { PlanesyCoberturasPage } from '@app/pages/planes-y-coberturas/PlanesyCoberturasPage';
import { LoginPage } from '@app/pages/login/LoginPage';
import { RegisterPage } from '@app/pages/register/RegisterPage';
import { NotFoundPage } from '@app/pages/NotFoundPage';
import { ChatPage } from '@app/pages/chat/ChatPage';
import { NotificacionesPage } from '@app/pages/notificaciones/NotificacionesPage';
import { AdminDashboardPage } from '@app/pages/admin/AdminDashboardPage';
import AdminPlansPage from '@app/pages/admin/AdminPlansPage';
import { AdminUsersPage } from '@app/pages/admin/AdminUsersPage';
import { AdminCouponsPage } from '@app/pages/admin/AdminCouponsPage';
import { AdminClaimsPage } from '@app/pages/admin/AdminClaimsPage';
import { AdminEnterprisesPage } from '@app/pages/admin/AdminEnterprisesPage';
import { AdminContractsPage } from '@app/pages/admin/AdminContractsPage';
import { AdminEnterpriseInvoicesPage } from '@app/pages/admin/AdminEnterpriseInvoicesPage';
import { AdminPaymentsPage } from '@app/pages/admin/AdminPaymentsPage';
import { AdminBenefitsPage } from '@app/pages/admin/AdminBenefitsPage';
import { AdminVeterinariesPage } from '@app/pages/admin/AdminVeterinariesPage';
import { AdminBankAccountsPage } from '@app/pages/admin/AdminBankAccountsPage';
import { AdminPricingRulesPage } from '@app/pages/admin/AdminPricingRulesPage';
import { AdminIndicatorsPage } from '@app/pages/admin/AdminIndicatorsPage';
// Nuevas páginas
import { MascotasPage } from '@app/pages/mascotas/MascotasPage';
import { NuevaMascotaPage } from '@app/pages/mascotas/NuevaMascotaPage';
import { BonificacionesPage } from '@app/pages/bonificaciones/BonificacionesPage';
import { NuevaBonificacionPage } from '@app/pages/bonificaciones/NuevaBonificacionPage';
import { DetalleBonificacionPage } from '@app/pages/bonificaciones/DetalleBonificacionPage';
import EditarPlanPage from '@app/pages/admin/EditarPlanPage';
import { CrearPlanPage } from '@app/pages/admin/CrearPlanPage';
import { ProtectedRoute } from '@app/components/ProtectedRoute';
import { AdminProtectedRoute } from '@app/components/AdminProtectedRoute';
import { AdminLayout } from '@app/components/AdminLayout';
import { ErrorBoundary } from '@app/components/ErrorBoundary';

/**
 * CONVENCIONES DE RUTAS:
 * - RUTAS FRONTEND: En ESPAÑOL (/planes, /mascotas, /bonificaciones, /mi-cuenta)
 * - RUTAS BACKEND API: En INGLÉS (/api/v1/plans, /api/v1/pets, /api/v1/claims)
 */

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/inicio" replace />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/inicio',
    element: <HomePage />,
  },
  {
    path: '/iniciar-sesion',
    element: <LoginPage />,
  },
  {
    path: '/registro',
    element: <RegisterPage />,
  },
  
  // Rutas de usuario (ESPAÑOL)
  {
    path: '/tablero',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mi-cuenta',
    element: (
      <ProtectedRoute>
        <SucursalVirtualPage />
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
    path: '/planes',
    element: <PlanesyCoberturasPage />, // Público
  },
  {
    path: '/planes-y-coberturas',
    element: <PlanesyCoberturasPage />, // Público (misma página)
  },
  
  // Rutas de Mascotas
  {
    path: '/mascotas',
    element: (
      <ProtectedRoute>
        <MascotasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mascotas/nueva',
    element: (
      <ProtectedRoute>
        <NuevaMascotaPage />
      </ProtectedRoute>
    ),
  },
  
  // Rutas de Bonificaciones
  {
    path: '/bonificaciones',
    element: (
      <ProtectedRoute>
        <BonificacionesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/bonificaciones/nueva',
    element: (
      <ProtectedRoute>
        <NuevaBonificacionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/bonificaciones/:id',
    element: (
      <ProtectedRoute>
        <DetalleBonificacionPage />
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
    path: '/notificaciones',
    element: (
      <ProtectedRoute>
        <NotificacionesPage />
      </ProtectedRoute>
    ),
  },
  
  // Rutas de administración (ESPAÑOL)
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
      { path: 'planes/nuevo', element: <CrearPlanPage /> },
      { path: 'planes/:id/editar', element: <EditarPlanPage /> },
      { path: 'usuarios', element: <AdminUsersPage /> },
      { path: 'cupones', element: <AdminCouponsPage /> },
      { path: 'bonificaciones', element: <AdminClaimsPage /> },
      { path: 'empresas', element: <AdminEnterprisesPage /> },
      { path: 'contratos', element: <AdminContractsPage /> },
      { path: 'facturas-empresariales', element: <AdminEnterpriseInvoicesPage /> },
      { path: 'pagos', element: <AdminPaymentsPage /> },
      { path: 'beneficios', element: <AdminBenefitsPage /> },
      { path: 'veterinarias', element: <AdminVeterinariesPage /> },
      { path: 'cuentas-bancarias', element: <AdminBankAccountsPage /> },
      { path: 'reglas-precio', element: <AdminPricingRulesPage /> },
      { path: 'indicadores', element: <AdminIndicatorsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <ErrorBoundary />,
  },
]);
