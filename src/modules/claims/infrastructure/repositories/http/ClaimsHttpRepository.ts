/**
 * Claims HTTP Repository - /api/v1/claims
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type {
  ClaimResponse,
  CreateClaimRequest,
  ReviewClaimRequest,
  PayClaimRequest,
} from '../../../application/dto/ClaimDTO';

const BASE = '/api/v1/claims';

export const claimsApi = {
  list(): Promise<ClaimResponse[]> {
    return httpClient.get<ClaimResponse[]>(BASE);
  },

  get(id: string): Promise<ClaimResponse> {
    return httpClient.get<ClaimResponse>(`${BASE}/${id}`);
  },

  create(body: CreateClaimRequest): Promise<ClaimResponse> {
    return httpClient.post<ClaimResponse>(BASE, body);
  },

  review(id: string, body: ReviewClaimRequest): Promise<ClaimResponse> {
    return httpClient.post<ClaimResponse>(`${BASE}/${id}/review`, body);
  },

  pay(id: string, body: PayClaimRequest): Promise<ClaimResponse> {
    return httpClient.post<ClaimResponse>(`${BASE}/${id}/pay`, body);
  },
};
