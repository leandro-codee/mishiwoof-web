/**
 * Plans DTOs - /api/v1/plans (public list/get, admin CRUD)
 */

export interface PlanResponse {
  id: string;
  name: string;
  description?: string;
  base_price_uf: number;
  is_active: boolean;
  is_published: boolean;
  terms_pdf_url?: string;
  image_url?: string;
  color?: string;
  stars?: number;
  has_dental: boolean;
  has_preventive: boolean;
  deductible_uf: number;
  max_annual_coverage_uf?: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  base_price_uf: number;
  terms_pdf_url?: string;
  image_url?: string;
  color?: string;
  stars?: number;
  has_dental: boolean;
  has_preventive: boolean;
  deductible_uf: number;
  max_annual_coverage_uf?: number;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  base_price_uf?: number;
  is_active?: boolean;
  is_published?: boolean;
  terms_pdf_url?: string;
  image_url?: string;
  color?: string;
  stars?: number;
  has_dental?: boolean;
  has_preventive?: boolean;
  deductible_uf?: number;
  max_annual_coverage_uf?: number;
}
