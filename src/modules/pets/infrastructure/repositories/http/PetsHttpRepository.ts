/**
 * Pets HTTP Repository - /api/v1/pets
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type { PetResponse, CreatePetRequest, UpdatePetRequest } from '../../../application/dto/PetDTO';

const BASE = '/api/v1/pets';

export const petsApi = {
  list(): Promise<PetResponse[]> {
    return httpClient.get<PetResponse[]>(BASE);
  },

  get(id: string): Promise<PetResponse> {
    return httpClient.get<PetResponse>(`${BASE}/${id}`);
  },

  create(body: CreatePetRequest): Promise<PetResponse> {
    return httpClient.post<PetResponse>(BASE, body);
  },

  update(id: string, body: UpdatePetRequest): Promise<PetResponse> {
    return httpClient.put<PetResponse>(`${BASE}/${id}`, body);
  },

  delete(id: string): Promise<void> {
    return httpClient.delete(`${BASE}/${id}`);
  },

  uploadPhoto(id: string, file: File): Promise<PetResponse> {
    const form = new FormData();
    form.append('photo', file);
    const axios = httpClient.getAxiosInstance();
    return axios.post(`${BASE}/${id}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
