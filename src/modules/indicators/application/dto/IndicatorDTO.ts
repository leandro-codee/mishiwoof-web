/**
 * Indicators DTOs - /api/v1/indicators (UF, etc.)
 */

export interface IndicatorResponse {
  id: string;
  indicator_type: string;
  date: string;
  value: number;
  uf_value: number;
  source?: string;
  created_at: string;
}

export interface CreateIndicatorRequest {
  indicator_type?: string;
  date: string;
  value: number;
  source?: string;
}

/** Resultado de sincronizar desde CMF */
export interface SyncFromCMFResult {
  created: number;
  skipped: number;
}
