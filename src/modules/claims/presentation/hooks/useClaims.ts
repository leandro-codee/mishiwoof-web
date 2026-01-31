/**
 * useClaims - list, get, create, review (admin), pay (admin)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimsApi } from '../../infrastructure/repositories/http/ClaimsHttpRepository';

export const claimsKeys = {
  all: ['claims'] as const,
  list: () => [...claimsKeys.all, 'list'] as const,
  detail: (id: string) => [...claimsKeys.all, id] as const,
};

export function useClaimsList() {
  return useQuery({
    queryKey: claimsKeys.list(),
    queryFn: () => claimsApi.list(),
  });
}

export function useClaim(id: string | undefined | null) {
  return useQuery({
    queryKey: claimsKeys.detail(id ?? ''),
    queryFn: () => claimsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: claimsApi.create.bind(claimsApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: claimsKeys.all }),
  });
}

export function useReviewClaim(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof claimsApi.review>[1]) => claimsApi.review(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: claimsKeys.all }),
  });
}

export function usePayClaim(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof claimsApi.pay>[1]) => claimsApi.pay(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: claimsKeys.all }),
  });
}
