import { httpClient } from '@shared/infrastructure/http/base.client';
import { getApiV1Path } from '@shared/infrastructure/http/api.config';
import type { Asset, ListAssetsResponse, UpdateAssetRequest } from '../../../application/dto/AssetDTO';

/**
 * Build the download proxy URL for a file.
 * Uses relative path so it goes through Vite's dev proxy
 * and avoids mixed-content issues (HTTPS frontend → HTTP backend).
 */
export function getFileDownloadURL(fileId: string): string {
  return `${getApiV1Path()}/files/${fileId}/download`;
}

/**
 * Build the download proxy URL for a plan PDF.
 */
export function getPlanPDFDownloadURL(planId: string): string {
  return `${getApiV1Path()}/plans/${planId}/pdf-download`;
}

export const assetsApi = {
  async list(params?: {
    file_type?: string;
    tag?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListAssetsResponse> {
    return httpClient.get<ListAssetsResponse>('/files', { params });
  },

  async getById(id: string): Promise<Asset> {
    return httpClient.get<Asset>(`/files/${id}`);
  },

  async upload(file: File, assetType: string, tags: string[], altText?: string): Promise<Asset> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', assetType);
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }
    if (altText) {
      formData.append('alt_text', altText);
    }

    const axios = httpClient.getAxiosInstance();
    const response = await axios.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async update(id: string, data: UpdateAssetRequest): Promise<Asset> {
    return httpClient.put<Asset>(`/files/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return httpClient.delete(`/files/${id}`);
  },

  async listTags(): Promise<string[]> {
    return httpClient.get<string[]>('/files/tags');
  },
};
