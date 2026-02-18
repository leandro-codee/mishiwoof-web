import apiClient, { handleApiError } from './apiClient';

// ==================== TYPES ====================

export interface PlanResponse {
  id: string;
  name: string;
  description?: string;
  basePriceUf: number;
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
  coverages?: CoverageResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CoverageResponse {
  id: string;
  planId: string;
  coverageTypeId: string;
  coverageTypeName: string;
  benefitId: string;
  benefitName: string;
  coveragePercentage: number;
  maxAmountPerEventUf?: number;
  maxAnnualEvents?: number;
  disclaimer?: string;
}

export interface BenefitResponse {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface CoverageTypeResponse {
  id: string;
  name: string;
  description?: string;
  benefitId: string;
  displayOrder: number;
}

// ==================== SERVICE ====================

export const plansService = {
  // Get all published plans
  async getPlans(): Promise<PlanResponse[]> {
    try {
      const response = await apiClient.get('/plans');
      return response.data.plans || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get plan detail with coverages
  async getPlan(planId: string): Promise<PlanResponse> {
    try {
      const response = await apiClient.get(`/plans/${planId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all benefits
  async getBenefits(): Promise<BenefitResponse[]> {
    try {
      const response = await apiClient.get('/plans/benefits');
      return response.data.benefits || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get coverage types (optionally filtered by benefit)
  async getCoverageTypes(benefitId?: string): Promise<CoverageTypeResponse[]> {
    try {
      const params = benefitId ? { benefitId } : {};
      const response = await apiClient.get('/plans/coverage-types', { params });
      return response.data.coverageTypes || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Calculate plan price for a pet
  async calculatePlanPrice(planId: string, petId: string): Promise<{
    basePriceUf: number;
    appliedMultiplier: number;
    finalPriceUf: number;
    breakdown: Array<{
      rule: string;
      multiplier: number;
    }>;
  }> {
    try {
      const response = await apiClient.post(`/plans/${planId}/calculate-price`, { petId });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
