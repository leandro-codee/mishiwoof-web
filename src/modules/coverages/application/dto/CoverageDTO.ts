// Coverage Type DTOs

export interface CoverageType {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  benefitId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCoverageTypeRequest {
  name: string;
  description?: string;
  displayOrder?: number;
  benefitId?: string;
}

export interface UpdateCoverageTypeRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
  benefitId?: string;
}

// Benefit DTOs

export interface Benefit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateBenefitRequest {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateBenefitRequest {
  name?: string;
  description?: string;
  icon?: string;
}

// Coverage DTOs

export interface Coverage {
  id: string;
  planId: string;
  coverageTypeId: string;
  benefitId: string;
  coveragePercentage?: number;
  maxAmountPerEventUf?: number;
  maxAnnualEvents?: number;
  disclaimer?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCoverageRequest {
  planId: string;
  coverageTypeId: string;
  benefitId: string;
  coveragePercentage?: number;
  maxAmountPerEventUf?: number;
  maxAnnualEvents?: number;
  disclaimer?: string;
}

export interface UpdateCoverageRequest {
  coveragePercentage?: number;
  maxAmountPerEventUf?: number;
  maxAnnualEvents?: number;
  disclaimer?: string;
}
