/**
 * Plans HTTP Repository - /api/v1/plans
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type { PlanResponse, CreatePlanRequest, UpdatePlanRequest } from '../../../application/dto/PlanDTO';

const BASE = '/api/v1/plans';

export const plansApi = {
  list(): Promise<PlanResponse[]> {
    return httpClient.get<PlanResponse[]>(BASE);
  },

  get(id: string): Promise<PlanResponse> {
    return httpClient.get<PlanResponse>(`${BASE}/${id}`);
  },

  create(body: CreatePlanRequest): Promise<PlanResponse> {
    return httpClient.post<PlanResponse>(BASE, body);
  },

  update(id: string, body: UpdatePlanRequest): Promise<PlanResponse> {
    return httpClient.put<PlanResponse>(`${BASE}/${id}`, body);
  },

  delete(id: string): Promise<void> {
    return httpClient.delete(`${BASE}/${id}`);
  },

  togglePublish(id: string): Promise<PlanResponse> {
    return httpClient.patch<PlanResponse>(`${BASE}/${id}/publish`);
  },
};
