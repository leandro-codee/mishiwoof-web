import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { LoadingSpinner } from '@app/components/LoadingSpinner';
import { ErrorMessage } from '@app/components/ErrorMessage';

// TODO: Importar el servicio de claims cuando esté disponible
// import { claimsService } from '@modules/claims/infrastructure/repositories/http/ClaimsHttpRepository';

interface ClaimDetail {
  id: string;
  claimNumber: string;
  beneficiary: string;
  dni: string;
  email: string;
  submittedDate: string;
  status: string;
  totalAmount: number;
  items: Array<{
    id: string;
    service: string;
    category: string;
    approvedAmount: number;
  }>;
  documents: {
    requestForm?: { filename: string; url: string };
    invoice?: { filename: string; url: string };
  };
  bankAccount: {
    name: string;
    dni: string;
    bank: string;
    accountType: string;
    accountNumber: string;
  };
  pet: {
    name: string;
    type: string;
    plan: string;
    birthDate: string;
  };
  veterinary: {
    name: string;
    dni: string;
    clinicDNI: string;
  };
}

export const DetalleBonificacionPage = () => {
  const { id } = useParams<{ id: string }>();

  // TODO: Implementar query real cuando el servicio esté disponible
  const { data: claim, isLoading, error } = useQuery<ClaimDetail>({
    queryKey: ['claim', id],
    queryFn: async () => {
      // Mock data para desarrollo
      return {
        id: id || '',
        claimNumber: '02308',
        beneficiary: 'Maya',
        dni: '14206352-2',
        email: 'mayamathieu7@gmail.com',
        submittedDate: '2026-02-14',
        status: 'PENDING',
        totalAmount: 10000,
        items: [
          {
            id: '1',
            service: 'Consulta Médica',
            category: 'Consultas Veterinaria',
            approvedAmount: -1,
          },
        ],
        documents: {
          requestForm: {
            filename: 'Formulario Nimo 10-11.jpeg',
            url: '/documents/form.pdf',
          },
          invoice: {
            filename: 'Boleta Nimo 10-11.jpeg',
            url: '/documents/invoice.pdf',
          },
        },
        bankAccount: {
          name: 'Maya Mathieu',
          dni: '14206352-2',
          bank: 'Scotiabank',
          accountType: 'corriente',
          accountNumber: '981264844',
        },
        pet: {
          name: 'Nimo',
          type: 'Perro',
          plan: 'Senior',
          birthDate: '2016-02-24',
        },
        veterinary: {
          name: 'Islana Rodriguez',
          dni: '16544533-3',
          clinicDNI: '77785957-9',
        },
      };
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: 'warning' as const, label: 'Pendiente' },
      UNDER_REVIEW: { variant: 'default' as const, label: 'En Revisión' },
      APPROVED: { variant: 'success' as const, label: 'Aprobado' },
      REJECTED: { variant: 'destructive' as const, label: 'Rechazado' },
      PAID: { variant: 'success' as const, label: 'Pagado' },
    };
    const config = variants[status] || variants.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage message="Error al cargar los detalles de la bonificación" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header con botones de acción (Solo para admin) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalle de Bonificación</h1>
        <div className="flex gap-2">
          {/* TODO: Mostrar solo para admin y estados apropiados */}
          {(claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW') && (
            <>
              <Button variant="default" className="bg-green-600 hover:bg-green-700">
                Aprobar
              </Button>
              <Button variant="destructive">Rechazar</Button>
            </>
          )}
          {claim.status === 'APPROVED' && (
            <Button className="bg-blue-600 hover:bg-blue-700">Liquidar</Button>
          )}
        </div>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          {/* SECCIÓN 1: BENEFICIARIO */}
          <Card>
            <CardHeader className="bg-[#1a4d2e] text-white">
              <CardTitle>BENEFICIARIO</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">Nº solicitud:</span>
                <span>{claim.claimNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Beneficiario:</span>
                <span>{claim.beneficiary}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Rut:</span>
                <span>{claim.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">E-mail:</span>
                <span className="text-sm break-all">{claim.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Fecha Solicitud:</span>
                <span>{claim.submittedDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN 3: DOCUMENTOS */}
          <Card>
            <CardHeader className="bg-[#1a4d2e] text-white">
              <CardTitle>DOCUMENTOS</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {claim.documents.requestForm && (
                <div>
                  <p className="font-semibold mb-2">Formulario de solicitud:</p>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <span className="text-sm">{claim.documents.requestForm.filename}</span>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={claim.documents.requestForm.url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              {claim.documents.invoice && (
                <div>
                  <p className="font-semibold mb-2">Documento:</p>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <span className="text-sm">{claim.documents.invoice.filename}</span>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={claim.documents.invoice.url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECCIÓN 4: DATOS BANCARIOS */}
          <Card>
            <CardHeader className="bg-[#1a4d2e] text-white">
              <CardTitle>DATOS BANCARIOS</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">Nombre:</span>
                <span>{claim.bankAccount.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Rut:</span>
                <span>{claim.bankAccount.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Banco:</span>
                <span>{claim.bankAccount.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Tipo de cuenta:</span>
                <span>{claim.bankAccount.accountType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Nro cuenta:</span>
                <span>{claim.bankAccount.accountNumber}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          {/* SECCIÓN 2: BONIFICACIÓN */}
          <Card>
            <CardHeader className="bg-[#1a4d2e] text-white">
              <CardTitle>BONIFICACIÓN</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {claim.items.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Prestación:</span>
                    <span>{item.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Categoría:</span>
                    <span>{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Bonificación:</span>
                    <span className="text-green-600 font-bold">
                      ${item.approvedAmount === -1 ? 'Pendiente' : item.approvedAmount.toLocaleString('es-CL')}
                    </span>
                  </div>
                  {/* TODO: Botones MODIFICAR y ELIMINAR solo para admin */}
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                      MODIFICAR
                    </Button>
                    <Button size="sm" variant="destructive">
                      ELIMINAR
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Monto Total:</span>
                  <span>${claim.totalAmount.toLocaleString('es-CL')}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Estado:</span>
                {getStatusBadge(claim.status)}
              </div>
            </CardContent>
          </Card>

          {/* Grid inferior: Pet y Veterinary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECCIÓN 5: DATOS MASCOTA */}
            <Card>
              <CardHeader className="bg-[#1a4d2e] text-white">
                <CardTitle className="text-base">DATOS MASCOTA</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-semibold">Nombre:</span>
                  <span>{claim.pet.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Tipo:</span>
                  <span>{claim.pet.type}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Plan de salud:</span>
                  <span>{claim.pet.plan}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Fecha de cumpleaños:</span>
                  <span>{claim.pet.birthDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* SECCIÓN 6: DATOS VETERINARIO */}
            <Card>
              <CardHeader className="bg-[#1a4d2e] text-white">
                <CardTitle className="text-base">DATOS VETERINARIO</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-semibold">Nombre:</span>
                  <span>{claim.veterinary.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Rut:</span>
                  <span>{claim.veterinary.dni}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Rut centro veterinario:</span>
                  <span>{claim.veterinary.clinicDNI}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
