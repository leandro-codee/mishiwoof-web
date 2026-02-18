import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { PetForm } from '@app/components/forms/PetForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useToast } from '@components/ui/use-toast';
import { petsService, type CreatePetRequest } from '@shared/api/petsService';

export const NuevaMascotaPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const createPetMutation = useMutation({
    mutationFn: (data: CreatePetRequest) => petsService.createPet(data),
    onSuccess: () => {
      toast({
        title: '¡Mascota agregada!',
        description: 'Tu mascota ha sido registrada exitosamente.',
      });
      navigate('/mascotas');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo agregar la mascota',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (data: any) => {
    createPetMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/mascotas')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Mascotas
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">Agregar Nueva Mascota</CardTitle>
          <CardDescription>
            Completa la información de tu mascota para poder contratarle un plan de salud.
            Todos los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
      </Card>

      <PetForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/mascotas')}
        isLoading={createPetMutation.isPending}
      />
    </div>
  );
};
