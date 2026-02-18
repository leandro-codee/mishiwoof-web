/**
 * Users DTOs - /api/v1/users, /api/v1/admin/users
 */

export interface UserResponse {
  id: string;
  email: string;
  dni?: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  stateId?: string;
  gender?: string;
  picture?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  stateId?: string;
  gender?: string;
  picture?: string;
}

export interface ListUsersResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  dni?: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  picture?: string;
}

export interface UpdateUserRequest {
  email?: string;
  dni?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  stateId?: string;
  gender?: string;
  picture?: string;
}
