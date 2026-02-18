import { ClaimsTable } from '@app/components/claims/ClaimsTable';

export const AdminClaimsPage = () => {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Bonificaciones</h1>
          <p className="text-gray-600 mt-2">
            Administra todas las solicitudes de reembolso del sistema
          </p>
        </div>
      </div>

      <ClaimsTable isAdmin={true} />
    </div>
  );
};
