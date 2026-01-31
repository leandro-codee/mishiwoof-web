/**
 * Token Helper - reads JWT from auth store / localStorage for HttpClient
 */

import { authStore } from '@shared/infrastructure/auth/auth.store';

/**
 * Get access token for API requests (from auth store or localStorage fallback)
 */
export function getInternalJwtToken(): string | null {
  try {
    return authStore.getAccessToken() ?? localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token') ?? null;
  } catch (error) {
    console.error('[TokenHelper] Error getting internal JWT token:', error);
    return null;
  }
}

/**
 * Clear all auth storage (tokens + user). Used on 401 logout.
 */
export function clearAuthStorage(): void {
  try {
    authStore.clearAuth();
  } catch (error) {
    console.error('[TokenHelper] Error clearing auth storage:', error);
  }
}
