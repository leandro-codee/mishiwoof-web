/**
 * Auth DTOs - request/response types for API /api/v1/auth
 */

export interface RegisterRequest {
  email: string;
  password: string;
  dni?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  stateId?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  dni: string;
  role: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ConfirmEmailRequest {
  token: string;
}
