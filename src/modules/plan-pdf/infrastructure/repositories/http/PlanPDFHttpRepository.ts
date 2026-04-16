import { httpClient } from '@shared/infrastructure/http/base.client';
import type {
  PlanPDFConfig,
  GeneratePDFRequest,
  GeneratePDFResponse,
  UploadAssetResponse,
} from '../../../application/dto/PlanPDFDTO';

export const planPdfApi = {
  async getPDFConfig(planId: string): Promise<PlanPDFConfig> {
    return httpClient.get<PlanPDFConfig>(`/plans/${planId}/pdf-config`);
  },

  async savePDFConfig(planId: string, config: Omit<PlanPDFConfig, 'id' | 'planId' | 'createdAt' | 'updatedAt'>): Promise<PlanPDFConfig> {
    return httpClient.put<PlanPDFConfig>(`/plans/${planId}/pdf-config`, config);
  },

  async generatePDF(planId: string, config: GeneratePDFRequest): Promise<GeneratePDFResponse> {
    return httpClient.post<GeneratePDFResponse>(`/plans/${planId}/generate-pdf`, config);
  },

  async uploadAsset(file: File, assetType: 'logo' | 'hero_image'): Promise<UploadAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asset_type', assetType);

    const axios = httpClient.getAxiosInstance();
    const response = await axios.post('/pdf-assets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};
