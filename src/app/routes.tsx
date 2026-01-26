import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardPage } from '@app/pages/dashboard/DashboardPage';
import { HomePage } from '@app/pages/home/HomePage';
import { SucursalVirtualPage } from '@app/pages/sucursal-virtual/SucursalVirtualPage';
import { PlanesyCoberturasPage } from '@app/pages/planes-y-coberturas/PlanesyCoberturasPage';
import { ContratacionPage } from '@app/pages/contratacion/ContratacionPage';
import { NotFoundPage } from '@app/pages/NotFoundPage';

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
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/sucursal-virtual',
    element: <SucursalVirtualPage />,
  },
  {
    path: '/planes-y-coberturas',
    element: <PlanesyCoberturasPage />,
  },
  {
    path: '/contratacion',
    element: <ContratacionPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
