/**
 * useIndicators - UF latest, list, by date, create (admin)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { indicatorsApi } from '../../infrastructure/repositories/http/IndicatorsHttpRepository';

export const indicatorsKeys = {
  latest: ['indicators', 'latest'] as const,
  list: () => ['indicators', 'list'] as const,
  byDate: (date: string) => ['indicators', 'date', date] as const,
};

export function useIndicatorLatest() {
  return useQuery({
    queryKey: indicatorsKeys.latest,
    queryFn: () => indicatorsApi.getLatest(),
  });
}

export function useIndicatorsList() {
  return useQuery({
    queryKey: indicatorsKeys.list(),
    queryFn: () => indicatorsApi.list(),
  });
}

export function useIndicatorByDate(date: string) {
  return useQuery({
    queryKey: indicatorsKeys.byDate(date),
    queryFn: () => indicatorsApi.getByDate(date),
    enabled: !!date,
  });
}

export function useCreateIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: indicatorsApi.create.bind(indicatorsApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['indicators'] }),
  });
}
