/**
 * useEnterprises - list, get, create, contracts, memberships (admin)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enterprisesApi } from '../../infrastructure/repositories/http/EnterprisesHttpRepository';

export const enterprisesKeys = {
  all: ['enterprises'] as const,
  list: () => [...enterprisesKeys.all, 'list'] as const,
  detail: (id: string) => [...enterprisesKeys.all, id] as const,
  memberships: (enterpriseId: string) => [...enterprisesKeys.all, enterpriseId, 'memberships'] as const,
};

export function useEnterprisesList() {
  return useQuery({
    queryKey: enterprisesKeys.list(),
    queryFn: () => enterprisesApi.list(),
  });
}

export function useEnterprise(id: string | undefined | null) {
  return useQuery({
    queryKey: enterprisesKeys.detail(id ?? ''),
    queryFn: () => enterprisesApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateEnterprise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enterprisesApi.create.bind(enterprisesApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: enterprisesKeys.all }),
  });
}

export function useCreateContract(enterpriseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enterprisesApi.createContract.bind(enterprisesApi, enterpriseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: enterprisesKeys.all }),
  });
}

export function useAddMembership(enterpriseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof enterprisesApi.addMembership>[1]) =>
      enterprisesApi.addMembership(enterpriseId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: enterprisesKeys.memberships(enterpriseId) }),
  });
}

export function useMemberships(enterpriseId: string | undefined | null) {
  return useQuery({
    queryKey: enterprisesKeys.memberships(enterpriseId ?? ''),
    queryFn: () => enterprisesApi.listMemberships(enterpriseId!),
    enabled: !!enterpriseId,
  });
}

export function useRemoveMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enterprisesApi.removeMembership.bind(enterprisesApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: enterprisesKeys.all }),
  });
}
