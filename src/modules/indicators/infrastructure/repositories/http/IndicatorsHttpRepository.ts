/**
 * Indicators HTTP Repository - /api/v1/indicators
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type { IndicatorResponse, CreateIndicatorRequest, SyncFromCMFResult } from '../../../application/dto/IndicatorDTO';

const BASE = '/indicators';

export type SyncFromCMFOptions = {
  date?: string;   // YYYY-MM-DD
  year?: number;
  month?: number;  // 1-12, con year
};

export const indicatorsApi = {
  getLatest(): Promise<IndicatorResponse> {
    return httpClient.get<IndicatorResponse>(`${BASE}/latest`);
  },

  list(limit = 10, offset = 0): Promise<IndicatorResponse[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    return httpClient.get<IndicatorResponse[]>(`${BASE}?${params.toString()}`);
  },

  getByDate(date: string): Promise<IndicatorResponse> {
    return httpClient.get<IndicatorResponse>(`${BASE}/date?date=${encodeURIComponent(date)}`);
  },

  create(body: CreateIndicatorRequest): Promise<IndicatorResponse> {
    return httpClient.post<IndicatorResponse>(BASE, body);
  },

  /** Sincroniza UF desde la API CMF (admin). Sin params = hoy; year+month = mes; date = un día. */
  syncFromCMF(options: SyncFromCMFOptions = {}): Promise<SyncFromCMFResult> {
    const params = new URLSearchParams();
    if (options.date) params.set('date', options.date);
    if (options.year != null) params.set('year', String(options.year));
    if (options.month != null) params.set('month', String(options.month));
    const qs = params.toString();
    return httpClient.post<SyncFromCMFResult>(`${BASE}/sync${qs ? `?${qs}` : ''}`);
  },
};
