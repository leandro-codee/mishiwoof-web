/**
 * Coupons DTOs - /api/v1/coupons (validate public, CRUD admin)
 */

export interface CouponResponse {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  validFrom: string;
  validTo: string;
  validMonths?: number;
  maxUses?: number;
  currentUses: number;
  maxUsesPerUser?: number;
  applicablePlanIds?: string[];
  minimumPriceUf?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponRequest {
  code: string;
  planId?: string;
  priceUf: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: CouponResponse;
  discountUf?: number;
  message?: string;
}

export interface CreateCouponRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FIXED_UF';
  discountValue: number;
  validFrom: string;
  validTo: string;
  validMonths?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  applicablePlanIds?: string[];
  minimumPriceUf?: number;
}

export interface UpdateCouponRequest {
  description?: string;
  validFrom?: string;
  validTo?: string;
  maxUses?: number;
  isActive?: boolean;
}
