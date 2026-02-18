import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Plus, Edit, PawPrint } from 'lucide-react';
import { LoadingSpinner } from '@app/components/LoadingSpinner';
import { ErrorMessage } from '@app/components/ErrorMessage';
import { petsService, type PetWithSubscription } from '@shared/api/petsService';

export const MascotasPage = () => {
  const navigate = useNavigate();

  const { data: pets = [], isLoading, error } = useQuery<PetWithSubscription[]>({
    queryKey: ['pets'],
    queryFn: () => petsService.getPets(),
  });

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return <Badge variant="secondary">Sin Suscripción</Badge>;
    }
    const config: Record<string, { variant: any; label: string }> = {
      ACTIVE: { variant: 'success' as const, label: 'Activo' },
      SUSPENDED: { variant: 'warning' as const, label: 'Suspendido' },
      CANCELED: { variant: 'secondary' as const, label: 'Cancelado' },
    };
    const { variant, label } = config[status] || config.ACTIVE;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage message="Error al cargar las mascotas" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Mascotas</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus mascotas y sus planes de salud
          </p>
        </div>
        <Button onClick={() => navigate('/mascotas/nueva')}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Mascota
        </Button>
      </div>

      {pets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PawPrint className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes mascotas registradas</h3>
            <p className="text-gray-600 text-center mb-4">
              Agrega tu primera mascota para comenzar a protegerla
            </p>
            <Button onClick={() => navigate('/mascotas/nueva')}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Mascota
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden">
              {pet.photoUrl ? (
                <div className="h-48 bg-gray-200">
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <PawPrint className="h-24 w-24 text-green-600 opacity-50" />
                </div>
              )}

              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pet.name}</CardTitle>
                    <CardDescription>
                      {pet.species === 'DOG' ? 'Perro' : 'Gato'}
                      {pet.breed && ` • ${pet.breed}`}
                    </CardDescription>
                  </div>
                  {getStatusBadge(pet.subscription?.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Edad:</span>
                    <span className="font-medium">
                      {pet.age} {pet.age === 1 ? 'año' : 'años'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de nacimiento:</span>
                    <span className="font-medium">
                      {new Date(pet.birthDate).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  {pet.subscription && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{pet.subscription.planName}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/mascotas/${pet.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  {!pet.subscription && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/mascotas/${pet.id}/suscribir`)}
                    >
                      Contratar Plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
