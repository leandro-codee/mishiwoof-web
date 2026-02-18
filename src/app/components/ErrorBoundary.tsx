/**
 * ErrorBoundary - Muestra un fallback cuando ocurre un error en el árbol de hijos
 * Compatible con React Router (useRouteError)
 */

import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function ErrorBoundary() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? error.statusText || error.data?.message || 'Algo salió mal'
    : error instanceof Error
      ? error.message
      : 'Ha ocurrido un error inesperado';

  const status = isRouteErrorResponse(error) ? error.status : null;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-[#FFDCE6]">
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {status ? `Error ${status}` : 'Error'}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white">
            <Link to="/inicio">Ir al inicio</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      </div>
    </div>
  );
}
