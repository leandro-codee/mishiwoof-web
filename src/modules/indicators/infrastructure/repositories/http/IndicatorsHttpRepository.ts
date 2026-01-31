/**
 * Indicators HTTP Repository - /api/v1/indicators
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type { IndicatorResponse, CreateIndicatorRequest } from '../../../application/dto/IndicatorDTO';

const BASE = '/api/v1/indicators';

export const indicatorsApi = {
  getLatest(): Promise<IndicatorResponse> {
    return httpClient.get<IndicatorResponse>(`${BASE}/latest`);
  },

  list(): Promise<IndicatorResponse[]> {
    return httpClient.get<IndicatorResponse[]>(BASE);
  },

  getByDate(date: string): Promise<IndicatorResponse> {
    return httpClient.get<IndicatorResponse>(`${BASE}/date?date=${encodeURIComponent(date)}`);
  },

  create(body: CreateIndicatorRequest): Promise<IndicatorResponse> {
    return httpClient.post<IndicatorResponse>(BASE, body);
  },
};
