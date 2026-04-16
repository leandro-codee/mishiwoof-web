/**
 * Regions API - /api/regions (public endpoints, no versionado)
 */

import { httpClient } from '../http/base.client';
import { getApiHost } from '../http/api.config';

const BASE = `${getApiHost()}/api/regions`;

export interface State {
  id: string;
  name: string;
  regionId: string;
}

export interface Region {
  id: string;
  name: string;
  code?: string;
  displayOrder: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  states?: State[];
}

/**
 * Get all regions with their states
 */
export async function getRegions(): Promise<Region[]> {
  return await httpClient.get<Region[]>(BASE);
}

/**
 * Get states by region ID
 */
export async function getStatesByRegion(regionId: string): Promise<State[]> {
  return await httpClient.get<State[]>(`${BASE}/${regionId}/states`);
}
