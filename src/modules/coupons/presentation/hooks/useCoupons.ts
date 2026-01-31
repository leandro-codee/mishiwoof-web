/**
 * useCoupons - validate (public), list/get/create/update/delete (admin)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '../../infrastructure/repositories/http/CouponsHttpRepository';

export const couponsKeys = {
  all: ['coupons'] as const,
  list: () => [...couponsKeys.all, 'list'] as const,
  detail: (id: string) => [...couponsKeys.all, id] as const,
};

export function useValidateCoupon() {
  return useMutation({
    mutationFn: couponsApi.validate.bind(couponsApi),
  });
}

export function useCouponsList() {
  return useQuery({
    queryKey: couponsKeys.list(),
    queryFn: () => couponsApi.list(),
  });
}

export function useCoupon(id: string | undefined | null) {
  return useQuery({
    queryKey: couponsKeys.detail(id ?? ''),
    queryFn: () => couponsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponsApi.create.bind(couponsApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: couponsKeys.all }),
  });
}

export function useUpdateCoupon(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof couponsApi.update>[1]) => couponsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: couponsKeys.all }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponsApi.delete.bind(couponsApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: couponsKeys.all }),
  });
}
