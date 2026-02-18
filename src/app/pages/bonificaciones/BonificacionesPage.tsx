import { Button } from '@components/ui/button';
import { ClaimsTable } from '@app/components/claims/ClaimsTable';
import { useNavigate } from 'react-router-dom';

export const BonificacionesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Bonificaciones</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus solicitudes de reembolso
          </p>
        </div>
        <Button onClick={() => navigate('/bonificaciones/nueva')}>
          Nueva Solicitud
        </Button>
      </div>

      <ClaimsTable isAdmin={false} />
    </div>
  );
};
