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
  benefitId: string;
  coveragePercentage?: number;  // 0-100
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
  description?: string;
  basePriceUf: number;
  basePriceCLP: number;
  isActive: boolean;
  isPublished: boolean;
  termsPdfUrl?: string;
  imageUrl?: string;
  color?: string;
  stars?: number;
  hasDental: boolean;
  hasPreventive: boolean;
  deductibleUf: number;
  maxAnnualCoverageUf?: number;
  createdAt: string;
  updatedAt: string;
  coverages?: Coverage[];
}

// ==================== REQUEST DTOs ====================

export interface CreatePlanRequest {
  name: string;
  description?: string;
  basePriceUf: number;
  isActive: boolean;
  isPublished: boolean;
  color?: string;
  stars?: number;
  hasDental: boolean;
  hasPreventive: boolean;
  deductibleUf: number;
  maxAnnualCoverageUf?: number;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  basePriceUf?: number;
  isActive?: boolean;
  isPublished?: boolean;
  color?: string;
  stars?: number;
  hasDental?: boolean;
  hasPreventive?: boolean;
  deductibleUf?: number;
  maxAnnualCoverageUf?: number;
}

export interface CoverageInput {
  id?: string;
  coverageTypeId: string;
  benefitId: string;
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
