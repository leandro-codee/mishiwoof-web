// src/modules/plans/infrastructure/repositories/http/PlansHttpRepository.ts

import { httpClient } from '@shared/infrastructure/http/base.client';
import type {
  Plan,
  CoverageType,
  Benefit,
  CreatePlanRequest,
  UpdatePlanRequest,
  BulkUpdateCoveragesRequest,
  CreateCoverageTypeRequest,
  CreateBenefitRequest,
} from '../../../application/dto/PlanDTO';

const BASE = '/api/v1';

export const plansApi = {
  // ==================== PLANS ====================
  
  async getAllPlans(publishedOnly: boolean = true): Promise<Plan[]> {
    return httpClient.get<Plan[]>(`${BASE}/plans`, {
      params: { published: publishedOnly },
    });
  },
  
  async getPlanById(planId: string, withCoverages: boolean = true): Promise<Plan> {
    return httpClient.get<Plan>(`${BASE}/plans/${planId}`, {
      params: { with_coverages: withCoverages },
    });
  },
  
  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    return httpClient.post<Plan>(`${BASE}/plans`, data);
  },
  
  async updatePlan(planId: string, data: UpdatePlanRequest): Promise<Plan> {
    return httpClient.put<Plan>(`${BASE}/plans/${planId}`, data);
  },
  
  async deletePlan(planId: string): Promise<void> {
    return httpClient.delete(`${BASE}/plans/${planId}`);
  },
  
  // ⭐ Bulk update coverages
  async bulkUpdateCoverages(planId: string, data: BulkUpdateCoveragesRequest): Promise<Plan> {
    return httpClient.put<Plan>(`${BASE}/plans/${planId}/coverages`, data);
  },
  
  async uploadPlanImage(planId: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const axios = httpClient.getAxiosInstance();
    const response = await axios.post(`${BASE}/plans/${planId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  
  async uploadPlanTermsPDF(planId: string, file: File): Promise<{ pdfUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const axios = httpClient.getAxiosInstance();
    const response = await axios.post(`${BASE}/plans/${planId}/terms-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  
  // ==================== COVERAGE TYPES ====================
  
  async getAllCoverageTypes(): Promise<CoverageType[]> {
    return httpClient.get<CoverageType[]>(`${BASE}/coverage-types`);
  },
  
  async createCoverageType(data: CreateCoverageTypeRequest): Promise<CoverageType> {
    return httpClient.post<CoverageType>(`${BASE}/coverage-types`, data);
  },
  
  // ==================== BENEFITS ====================
  
  async getAllBenefits(): Promise<Benefit[]> {
    return httpClient.get<Benefit[]>(`${BASE}/benefits`);
  },
  
  async createBenefit(data: CreateBenefitRequest): Promise<Benefit> {
    return httpClient.post<Benefit>(`${BASE}/benefits`, data);
  },
};
