/**
 * Centraliza la construcción de URLs de la API.
 * La variable de entorno VITE_API_BASE_URL debe contener SOLO el host
 * (p. ej. http://localhost:4800). El prefijo de versión se construye aquí
 * para poder convivir con futuras versiones (v2, v3, ...).
 */

export const API_V1_PREFIX = '/api/v1';

function normalizeHost(url: string): string {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `http://${trimmed}`;
  }
  return trimmed;
}

export function getApiHost(): string {
  const raw =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_PUBLIC_API_URL ||
    'http://localhost:4800';
  return normalizeHost(String(raw));
}

export function getApiV1BaseURL(): string {
  return `${getApiHost()}${API_V1_PREFIX}`;
}

/**
 * Returns just the path prefix `/api/v1` (no host).
 * Use this for browser-facing URLs (iframe src, img src, download hrefs)
 * so they go through the Vite dev proxy and avoid mixed-content issues.
 */
export function getApiV1Path(): string {
  return API_V1_PREFIX;
}
