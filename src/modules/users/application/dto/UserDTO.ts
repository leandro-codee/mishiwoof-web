/**
 * Users DTOs - /api/v1/users, /api/v1/admin/users
 */

export interface UserResponse {
  id: string;
  email: string;
  dni?: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  commune_id?: string;
  gender?: string;
  picture?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  commune_id?: string;
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
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  picture?: string;
}

export interface UpdateUserRequest {
  email?: string;
  dni?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  picture?: string;
}
