/**
 * usePlans - list plans (public), get plan, admin CRUD
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '../../infrastructure/repositories/http/PlansHttpRepository';

export const plansKeys = {
  all: ['plans'] as const,
  list: () => [...plansKeys.all, 'list'] as const,
  detail: (id: string) => [...plansKeys.all, id] as const,
};

export function usePlansList() {
  return useQuery({
    queryKey: plansKeys.list(),
    queryFn: () => plansApi.list(),
  });
}

export function usePlan(id: string | undefined | null) {
  return useQuery({
    queryKey: plansKeys.detail(id ?? ''),
    queryFn: () => plansApi.get(id!),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plansApi.create.bind(plansApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: plansKeys.all }),
  });
}

export function useUpdatePlan(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof plansApi.update>[1]) => plansApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: plansKeys.all }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plansApi.delete.bind(plansApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: plansKeys.all }),
  });
}

export function useTogglePublishPlan(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => plansApi.togglePublish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: plansKeys.all }),
  });
}
