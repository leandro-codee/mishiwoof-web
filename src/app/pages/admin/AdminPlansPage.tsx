// src/app/pages/admin/AdminPlansPage.tsx

import { useNavigate } from 'react-router-dom';
import { usePlans, useDeletePlan } from '@modules/plans/presentation/hooks/usePlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Eye, FileText, LayoutTemplate } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminPlansPage() {
  const navigate = useNavigate();
  const { data: plans, isLoading } = usePlans(false); // Include unpublished
  const deletePlanMutation = useDeletePlan();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDelete = async (planId: string) => {
    await deletePlanMutation.mutateAsync(planId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Cargando planes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Planes</h1>
          <p className="text-gray-600 mt-1">
            Administra los planes de seguro para mascotas
          </p>
        </div>
        <Button onClick={() => navigate('/admin/planes/nuevo')}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {plan.basePriceUf} UF / {formatCurrency(plan.basePriceCLP)}
                  </p>
                  {plan.tier && (
                    <p className="text-sm text-gray-600 mt-2">{plan.tier}</p>
                  )}
                </div>
                {plan.color && (
                  <div
                    className="w-10 h-10 rounded-full border-2 flex-shrink-0 ml-2"
                    style={{ backgroundColor: plan.color }}
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {plan.isPublished && (
                  <Badge variant="default">Publicado</Badge>
                )}
                {plan.isActive && (
                  <Badge className="bg-green-500">Activo</Badge>
                )}
                {!plan.isActive && (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </div>

              {/* Image */}
              {plan.imageUrl && (
                <div className="mb-4">
                  <img
                    src={plan.imageUrl}
                    alt={plan.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/admin/planes/${plan.id}/editar`)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/planes/${plan.id}/pdf`)}
                  title="Generar PDF"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/planes/${plan.id}/pagina`)}
                  title="Configurar página pública"
                >
                  <LayoutTemplate className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/planes/${plan.id}`, '_blank', 'noopener,noreferrer')}
                  title="Ver página pública"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El plan "{plan.name}" será eliminado
                        permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(plan.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans && plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No hay planes creados</p>
          <Button onClick={() => navigate('/admin/planes/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Plan
          </Button>
        </div>
      )}
    </div>
  );
}
