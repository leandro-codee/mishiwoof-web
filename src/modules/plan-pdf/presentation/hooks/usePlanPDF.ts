import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planPdfApi } from '../../infrastructure/repositories/http/PlanPDFHttpRepository';
import { plansKeys } from '@modules/plans/presentation/hooks/usePlans';
import { getPlanPDFDownloadURL } from '@modules/assets/infrastructure/repositories/http/AssetsHttpRepository';
import type { GeneratePDFRequest } from '../../application/dto/PlanPDFDTO';
import { toast } from 'sonner';

export const planPdfKeys = {
  all: ['plan-pdf'] as const,
  config: (planId: string) => [...planPdfKeys.all, 'config', planId] as const,
};

export function usePlanPDFConfig(planId: string | undefined) {
  return useQuery({
    queryKey: planPdfKeys.config(planId ?? ''),
    queryFn: () => planPdfApi.getPDFConfig(planId!),
    enabled: !!planId,
  });
}

export function useSavePDFConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, config }: {
      planId: string;
      config: {
        logoUrl: string | null;
        heroImageUrl: string | null;
        accentColor: string;
        footerText: string;
        showUfValue: boolean;
        customTitle: string | null;
      };
    }) => planPdfApi.savePDFConfig(planId, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: planPdfKeys.config(variables.planId) });
      toast.success('Configuración guardada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al guardar configuración');
    },
  });
}

export function useGeneratePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, config }: { planId: string; config: GeneratePDFRequest }) =>
      planPdfApi.generatePDF(planId, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: plansKeys.detail(variables.planId, false) });
      queryClient.invalidateQueries({ queryKey: plansKeys.all });
      toast.success('PDF generado exitosamente', {
        action: {
          label: 'Abrir',
          onClick: () => window.open(getPlanPDFDownloadURL(variables.planId), '_blank'),
        },
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al generar PDF');
    },
  });
}

export function useUploadPDFAsset() {
  return useMutation({
    mutationFn: ({ file, assetType }: { file: File; assetType: 'logo' | 'hero_image' }) =>
      planPdfApi.uploadAsset(file, assetType),
    onSuccess: () => {
      toast.success('Imagen subida exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al subir imagen');
    },
  });
}
