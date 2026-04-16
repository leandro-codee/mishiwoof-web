// src/modules/plans/application/dto/PlanDTO.ts

export interface Benefit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface CoverageType {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  benefitId?: string;
  benefit?: Benefit;
}

export interface Coverage {
  id: string;
  planId: string;
  coverageTypeId: string;
  benefitId?: string;
  coveragePercentage?: number;
  maxAmountPerEventUf?: number;
  maxAmountPerEventClp?: number;
  maxAnnualEvents?: number;
  disclaimer?: string;
  coverageType: CoverageType;
  benefit?: Benefit;
}

export interface Plan {
  id: string;
  name: string;
  basePriceUf: number;
  basePriceCLP: number;
  isActive: boolean;
  isPublished: boolean;
  /** Texto comercial / resumen si el backend lo expone */
  description?: string;
  termsPdfUrl?: string;
  imageUrl?: string;
  color?: string;
  tier?: string;
  createdAt: string;
  updatedAt: string;
  coverages?: Coverage[];
}

// ==================== REQUEST DTOs ====================
// Alineados con tabla plans: name, price_uf, is_active, is_public, pdf_url, img_url, color, tier.

export interface CreatePlanRequest {
  name: string;
  basePriceUf: number;
  isActive: boolean;
  isPublished: boolean;
  color?: string;
  tier?: string;
  pdfUrl?: string;
  imageUrl?: string;
}

export interface UpdatePlanRequest {
  name?: string;
  basePriceUf?: number;
  isActive?: boolean;
  isPublished?: boolean;
  color?: string;
  tier?: string;
  pdfUrl?: string;
  imageUrl?: string;
}

export interface CoverageInput {
  id?: string;
  coverageTypeId: string;
  benefitId?: string;
  coveragePercentage?: number;
  maxAmountPerEventUf?: number;
  maxAnnualEvents?: number;
  disclaimer?: string;
}

export interface BulkUpdateCoveragesRequest {
  coverages: CoverageInput[];
}

export interface CreateCoverageTypeRequest {
  name: string;
  description?: string;
  displayOrder: number;
  benefitId?: string;
}

export interface CreateBenefitRequest {
  name: string;
  description?: string;
  icon?: string;
}

// ==================== PUBLIC PLAN DETAIL PAGE ====================

export interface PlanDetailPlan {
  id: string;
  name: string;
  tier: string | null;
  price_uf: number;
  color: string | null;
  pdf_url: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  is_active: boolean;
}

export interface PlanDetailCoverage {
  id: string;
  name: string;
  category_name: string;
  category_code: string;
  coverage_percentage: number; // 0..1
  cap_uf_per_event: number | null;
  events_annual: number | null;
  disclaimer: string | null;
  order_index: number;
}

export interface PlanDetailResponse {
  plan: PlanDetailPlan;
  coverages: PlanDetailCoverage[];
  annual_cap_uf: number;
  uf_value_today: number;
  annual_cap_note: string;
  cta_url: string;
  cta_text: string;
}

// ==================== ADMIN PAGE CONFIG ====================

export interface PlanPageConfig {
  planId: string;
  heroImageUrl: string | null;
  annualCapNote: string;
  ctaUrl: string;
  ctaText: string;
}

export type SavePlanPageConfigRequest = Omit<PlanPageConfig, 'planId'>;
