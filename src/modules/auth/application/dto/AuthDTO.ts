/**
 * Auth DTOs - request/response types for API /api/v1/auth
 */

export interface RegisterRequest {
  email: string;
  password: string;
  dni?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  email_verified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  email: string;
  role: string;
  access_token: string;
  refresh_token: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ConfirmEmailRequest {
  token: string;
}
