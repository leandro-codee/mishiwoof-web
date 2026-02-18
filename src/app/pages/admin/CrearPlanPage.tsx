import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PlanEditor } from '@app/components/plans/PlanEditor';

export const CrearPlanPage = () => {
  const navigate = useNavigate();

  const handleSave = async (data: any) => {
    try {
      // TODO: Implementar creación de plan
      console.log('Creating plan:', data);
      
      // Simulación
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Success - volver a lista de planes
      navigate('/admin/planes');
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/planes')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear Nuevo Plan</h1>
          <p className="text-gray-600 mt-1">
            Configura un nuevo plan de seguro para mascotas
          </p>
        </div>
      </div>

      <PlanEditor
        onSave={handleSave}
        onCancel={() => navigate('/admin/planes')}
      />
    </div>
  );
};
