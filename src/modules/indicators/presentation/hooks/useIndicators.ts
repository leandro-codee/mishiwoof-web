/**
 * useIndicators - UF latest, list, by date, create (admin)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { indicatorsApi } from '../../infrastructure/repositories/http/IndicatorsHttpRepository';

/** Fecha de hoy en YYYY-MM-DD (para UF "actual" = la de hoy, no el último registro de la DB). */
function getTodayISO(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export const indicatorsKeys = {
  latest: (date?: string) => ['indicators', 'latest', date ?? getTodayISO()] as const,
  list: (limit: number, offset: number) => ['indicators', 'list', limit, offset] as const,
  byDate: (date: string) => ['indicators', 'date', date] as const,
};

/** UF de hoy (now()). Pide por fecha actual; si no hay en DB, el backend puede obtenerla de CMF. */
export function useIndicatorLatest() {
  const today = getTodayISO();
  return useQuery({
    queryKey: indicatorsKeys.latest(today),
    queryFn: () => indicatorsApi.getByDate(today),
  });
}

const DEFAULT_PAGE_SIZE = 10;

export function useIndicatorsList(limit = DEFAULT_PAGE_SIZE, offset = 0) {
  return useQuery({
    queryKey: indicatorsKeys.list(limit, offset),
    queryFn: () => indicatorsApi.list(limit, offset),
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

export function useSyncFromCMF() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (options?: Parameters<typeof indicatorsApi.syncFromCMF>[0]) =>
      indicatorsApi.syncFromCMF(options ?? {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['indicators'] }),
  });
}
