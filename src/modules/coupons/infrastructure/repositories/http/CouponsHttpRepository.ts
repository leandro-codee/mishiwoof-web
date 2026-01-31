/**
 * Coupons HTTP Repository - /api/v1/coupons
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type {
  CouponResponse,
  ValidateCouponRequest,
  ValidateCouponResponse,
  CreateCouponRequest,
  UpdateCouponRequest,
} from '../../../application/dto/CouponDTO';

const BASE = '/api/v1/coupons';

export const couponsApi = {
  validate(body: ValidateCouponRequest): Promise<ValidateCouponResponse> {
    return httpClient.post<ValidateCouponResponse>(`${BASE}/validate`, body);
  },

  list(): Promise<CouponResponse[]> {
    return httpClient.get<CouponResponse[]>(BASE);
  },

  get(id: string): Promise<CouponResponse> {
    return httpClient.get<CouponResponse>(`${BASE}/${id}`);
  },

  create(body: CreateCouponRequest): Promise<CouponResponse> {
    return httpClient.post<CouponResponse>(BASE, body);
  },

  update(id: string, body: UpdateCouponRequest): Promise<CouponResponse> {
    return httpClient.put<CouponResponse>(`${BASE}/${id}`, body);
  },

  delete(id: string): Promise<void> {
    return httpClient.delete(`${BASE}/${id}`);
  },
};
