/**
 * Rotación de refresh token: un solo POST /auth/refresh en vuelo (evita "already used").
 * Tras éxito se persisten siempre accessToken y refreshToken nuevos.
 */

import axios from 'axios';
import { authStore } from '@shared/infrastructure/auth/auth.store';

let inflightRefresh: Promise<{ accessToken: string; refreshToken: string }> | null = null;

function unwrapBackendPayload(data: unknown): unknown {
  if (
    data &&
    typeof data === 'object' &&
    'success' in data &&
    (data as { success?: boolean }).success === true &&
    'data' in data
  ) {
    return (data as { data: unknown }).data;
  }
  return data;
}

/**
 * Rutas donde un 401 no debe disparar refresh (login incorrecto, registro, etc.).
 */
export function shouldSkipAuthRefreshForUrl(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.includes('http') ? (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  })() : url;
  const n = path.replace(/\/+/g, '/');
  return (
    n.includes('/auth/login') ||
    n.includes('/auth/register') ||
    n.includes('/auth/refresh') ||
    n.includes('/auth/request-password-reset') ||
    n.includes('/auth/forgot-password') ||
    n.includes('/auth/reset-password') ||
    n.includes('/auth/confirm-email') ||
    n.includes('/auth/verify-email')
  );
}

export async function refreshSessionWithRotation(baseURL: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  if (inflightRefresh) {
    return inflightRefresh;
  }

  inflightRefresh = (async () => {
    const refreshToken = authStore.getRefreshToken();
    if (!refreshToken?.trim()) {
      throw new Error('NO_REFRESH_TOKEN');
    }

    const clean = baseURL.replace(/\/$/, '');
    if (!clean) {
      throw new Error('NO_API_BASE_URL');
    }

    const { data: raw } = await axios.post(
      `${clean}/auth/refresh`,
      { refreshToken: refreshToken.trim() },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      },
    );

    const body = unwrapBackendPayload(raw) as {
      accessToken?: string;
      refreshToken?: string;
      access_token?: string;
      refresh_token?: string;
    };

    const accessToken = body.accessToken ?? body.access_token;
    const newRefresh = body.refreshToken ?? body.refresh_token;

    if (!accessToken?.trim() || !newRefresh?.trim()) {
      throw new Error('INVALID_REFRESH_RESPONSE');
    }

    authStore.setSessionTokens(accessToken.trim(), newRefresh.trim());
    return { accessToken: accessToken.trim(), refreshToken: newRefresh.trim() };
  })().finally(() => {
    inflightRefresh = null;
  });

  return inflightRefresh;
}
