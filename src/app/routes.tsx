import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardPage } from '@app/pages/dashboard/DashboardPage';
import { NotFoundPage } from '@app/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
