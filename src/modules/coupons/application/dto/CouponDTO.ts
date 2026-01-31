/**
 * Coupons DTOs - /api/v1/coupons (validate public, CRUD admin)
 */

export interface CouponResponse {
  id: string;
  code: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  valid_from: string;
  valid_to: string;
  valid_months?: number;
  max_uses?: number;
  current_uses: number;
  max_uses_per_user?: number;
  applicable_plan_ids?: string[];
  minimum_price_uf?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidateCouponRequest {
  code: string;
  plan_id?: string;
  price_uf: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: CouponResponse;
  discount_uf?: number;
  message?: string;
}

export interface CreateCouponRequest {
  code: string;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FIXED_UF';
  discount_value: number;
  valid_from: string;
  valid_to: string;
  valid_months?: number;
  max_uses?: number;
  max_uses_per_user?: number;
  applicable_plan_ids?: string[];
  minimum_price_uf?: number;
}

export interface UpdateCouponRequest {
  description?: string;
  valid_from?: string;
  valid_to?: string;
  max_uses?: number;
  is_active?: boolean;
}
