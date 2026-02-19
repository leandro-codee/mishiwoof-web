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
