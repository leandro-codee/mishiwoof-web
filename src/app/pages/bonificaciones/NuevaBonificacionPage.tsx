import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ClaimForm } from '@app/components/forms/ClaimForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useToast } from '@components/ui/use-toast';
import { claimsService, type CreateClaimRequest } from '@shared/api/claimsService';

export const NuevaBonificacionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const createClaimMutation = useMutation({
    mutationFn: async ({ data, files }: { data: CreateClaimRequest; files: { requestForm: File; invoices: File[] } }) => {
      // 1. Create claim
      const response = await claimsService.createClaim(data);
      const claimId = response.claimId;

      // 2. Upload request form
      if (files.requestForm) {
        await claimsService.uploadRequestForm(claimId, files.requestForm);
      }

      // 3. Upload invoices
      for (const invoice of files.invoices) {
        await claimsService.uploadInvoice(claimId, invoice);
      }

      return claimId;
    },
    onSuccess: () => {
      toast({
        title: '¡Solicitud creada!',
        description: 'Tu solicitud de reembolso ha sido enviada exitosamente.',
      });
      navigate('/bonificaciones');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la solicitud',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (data: any, files: { requestForm: File; invoices: File[] }) => {
    createClaimMutation.mutate({ data, files });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/bonificaciones')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Bonificaciones
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">Nueva Solicitud de Reembolso</CardTitle>
          <CardDescription>
            Completa el formulario para solicitar el reembolso de gastos veterinarios.
            Recuerda que tu mascota debe tener al menos 30 días de suscripción activa.
          </CardDescription>
        </CardHeader>
      </Card>

      <ClaimForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/bonificaciones')}
        isLoading={createClaimMutation.isPending}
      />
    </div>
  );
};
