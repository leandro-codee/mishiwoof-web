/**
 * Auth HTTP Repository - consumes /api/v1/auth
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import { authStore } from '@shared/infrastructure/auth/auth.store';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  ConfirmEmailRequest,
} from '../../../application/dto/AuthDTO';

/** Relativo a VITE_API_BASE_URL (incluye /api/v1) */
const BASE = '/auth';

export const authApi = {
  async register(body: RegisterRequest): Promise<RegisterResponse> {
    return httpClient.post<RegisterResponse>(`${BASE}/register`, body);
  },

  async login(body: LoginRequest): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>(`${BASE}/login`, body);
  },

  async refresh(body: RefreshRequest): Promise<RefreshResponse> {
    return httpClient.post<RefreshResponse>(`${BASE}/refresh`, body);
  },

  async logout(): Promise<void> {
    await httpClient.post(`${BASE}/logout`);
    authStore.clearAuth();
  },

  async requestPasswordReset(body: RequestPasswordResetRequest): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(`${BASE}/request-password-reset`, body);
  },

  async resetPassword(body: ResetPasswordRequest): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(`${BASE}/reset-password`, body);
  },

  async confirmEmail(body: ConfirmEmailRequest): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(`${BASE}/confirm-email`, body);
  },
};

function setTokensFromLogin(res: LoginResponse | RegisterResponse): void {
  const user = {
    user_id: res.user.id,
    email: res.user.email,
    role: res.user.role,
  };
  authStore.setTokens(res.accessToken, res.refreshToken, user);
}

export async function loginAndStore(body: LoginRequest): Promise<LoginResponse> {
  const res = await authApi.login(body);
  setTokensFromLogin(res);
  return res;
}

export async function registerAndStore(body: RegisterRequest): Promise<RegisterResponse> {
  const res = await authApi.register(body);
  setTokensFromLogin(res);
  return res;
}
