// src/modules/plans/presentation/hooks/usePlans.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '../../infrastructure/repositories/http/PlansHttpRepository';
import type {
  CreatePlanRequest,
  UpdatePlanRequest,
  BulkUpdateCoveragesRequest,
  CreateCoverageTypeRequest,
  CreateBenefitRequest,
  SavePlanPageConfigRequest,
} from '../../application/dto/PlanDTO';
import { toast } from 'sonner';

// ==================== QUERY KEYS ====================

export const plansKeys = {
  all: ['plans'] as const,
  lists: () => [...plansKeys.all, 'list'] as const,
  list: (publishedOnly: boolean) => [...plansKeys.lists(), { publishedOnly }] as const,
  details: () => [...plansKeys.all, 'detail'] as const,
  detail: (id: string, withCoverages: boolean) => [...plansKeys.details(), id, { withCoverages }] as const,
  publicDetail: (id: string) => [...plansKeys.all, 'publicDetail', id] as const,
  pageConfig: (id: string) => [...plansKeys.all, 'pageConfig', id] as const,
};

export const coverageTypesKeys = {
  all: ['coverage-types'] as const,
  lists: () => [...coverageTypesKeys.all, 'list'] as const,
};

export const benefitsKeys = {
  all: ['benefits'] as const,
  lists: () => [...benefitsKeys.all, 'list'] as const,
};

// ==================== PLANS HOOKS ====================

export function usePlans(publishedOnly: boolean = true) {
  return useQuery({
    queryKey: plansKeys.list(publishedOnly),
    queryFn: () => plansApi.getAllPlans(publishedOnly),
  });
}

export function usePlan(planId: string | undefined, withCoverages: boolean = true) {
  return useQuery({
    queryKey: plansKeys.detail(planId ?? '', withCoverages),
    queryFn: () => plansApi.getPlanById(planId!, withCoverages),
    enabled: !!planId,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanRequest) => plansApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plansKeys.all });
      toast.success('Plan creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear el plan');
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: UpdatePlanRequest }) =>
      plansApi.updatePlan(planId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: plansKeys.all });
      queryClient.invalidateQueries({ queryKey: plansKeys.detail(data.id, false) });
      toast.success('Plan actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar el plan');
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => plansApi.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plansKeys.all });
      toast.success('Plan eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar el plan');
    },
  });
}

// ⭐ BULK UPDATE COVERAGES
export function useBulkUpdateCoverages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: BulkUpdateCoveragesRequest }) =>
      plansApi.bulkUpdateCoverages(planId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: plansKeys.detail(data.id, true) });
      toast.success('Coberturas actualizadas exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar coberturas');
    },
  });
}

export function useUploadPlanImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, file }: { planId: string; file: File }) =>
      plansApi.uploadPlanImage(planId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: plansKeys.detail(variables.planId, false) });
      toast.success('Imagen subida exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al subir imagen');
    },
  });
}

export function useUploadPlanTermsPDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, file }: { planId: string; file: File }) =>
      plansApi.uploadPlanTermsPDF(planId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: plansKeys.detail(variables.planId, false) });
      toast.success('PDF subido exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al subir PDF');
    },
  });
}

// ==================== COVERAGE TYPES HOOKS ====================

export function useCoverageTypes() {
  return useQuery({
    queryKey: coverageTypesKeys.lists(),
    queryFn: () => plansApi.getAllCoverageTypes(),
  });
}

export function useCreateCoverageType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCoverageTypeRequest) => plansApi.createCoverageType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coverageTypesKeys.all });
      toast.success('Tipo de cobertura creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear tipo de cobertura');
    },
  });
}

// ==================== BENEFITS HOOKS ====================

export function useBenefits() {
  return useQuery({
    queryKey: benefitsKeys.lists(),
    queryFn: () => plansApi.getAllBenefits(),
  });
}

export function useCreateBenefit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBenefitRequest) => plansApi.createBenefit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: benefitsKeys.all });
      toast.success('Beneficio creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear beneficio');
    },
  });
}

// ==================== PUBLIC DETAIL PAGE ====================

export function usePlanDetail(planId: string | undefined) {
  return useQuery({
    queryKey: plansKeys.publicDetail(planId ?? ''),
    queryFn: () => plansApi.getPlanDetail(planId!),
    enabled: !!planId,
    retry: false,
  });
}

// ==================== ADMIN PAGE CONFIG ====================

export function usePlanPageConfig(planId: string | undefined) {
  return useQuery({
    queryKey: plansKeys.pageConfig(planId ?? ''),
    queryFn: () => plansApi.getPlanPageConfig(planId!),
    enabled: !!planId,
  });
}

export function useSavePlanPageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: SavePlanPageConfigRequest }) =>
      plansApi.savePlanPageConfig(planId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: plansKeys.pageConfig(variables.planId) });
      queryClient.invalidateQueries({ queryKey: plansKeys.publicDetail(variables.planId) });
      toast.success('Configuración de la página guardada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al guardar la configuración');
    },
  });
}
