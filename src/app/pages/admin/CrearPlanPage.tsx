import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PlanEditor } from '@app/components/plans/PlanEditor';
import { useCreatePlan, useBulkUpdateCoverages } from '@modules/plans/presentation/hooks/usePlans';
import type { CreatePlanRequest } from '@modules/plans/application/dto/PlanDTO';

export const CrearPlanPage = () => {
  const navigate = useNavigate();
  const createPlanMutation = useCreatePlan();
  const bulkUpdateCoveragesMutation = useBulkUpdateCoverages();

  const handleSave = async (data: {
    generalInfo: {
      name: string;
      basePriceUF?: number;
      color?: string;
      tier?: string;
      isActive?: boolean;
      isPublished?: boolean;
      [key: string]: unknown;
    };
    coverages?: Array<{
      coverageTypeId: string;
      benefitId?: string;
      coveragePercentage?: number;
      maxAmountPerEventUF?: number;
      maxAmountPerEventUf?: number;
      maxAnnualEvents?: number;
      disclaimer?: string;
    }>;
  }) => {
    try {
      const payload: CreatePlanRequest = {
        name: data.generalInfo.name,
        basePriceUf: Number(data.generalInfo.basePriceUF) || 0,
        isActive: data.generalInfo.isActive ?? true,
        isPublished: data.generalInfo.isPublished ?? false,
        color: data.generalInfo.color,
        tier: data.generalInfo.tier,
      };
      const plan = await createPlanMutation.mutateAsync(payload);
      if (data.coverages?.length) {
        await bulkUpdateCoveragesMutation.mutateAsync({
          planId: plan.id,
          data: {
            coverages: data.coverages.map((c) => ({
              coverageTypeId: c.coverageTypeId,
              benefitId: c.benefitId ?? '',
              coveragePercentage: c.coveragePercentage,
              maxAmountPerEventUf: c.maxAmountPerEventUF ?? c.maxAmountPerEventUf,
              maxAnnualEvents: c.maxAnnualEvents,
              disclaimer: c.disclaimer,
            })),
          },
        });
      }
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
