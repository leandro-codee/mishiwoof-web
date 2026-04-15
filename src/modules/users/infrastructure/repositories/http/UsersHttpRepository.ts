/**
 * Users HTTP Repository - /api/v1/users, /api/v1/admin/users
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type {
  UserResponse,
  UpdateProfileRequest,
  ListUsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../../application/dto/UserDTO';

const BASE = '';
const ADMIN = '/admin/users';

export const usersApi = {
  getMe(): Promise<UserResponse> {
    return httpClient.get<UserResponse>(`${BASE}/users/me`);
  },

  updateMe(body: UpdateProfileRequest): Promise<UserResponse> {
    return httpClient.put<UserResponse>(`${BASE}/users/me`, body);
  },

  listUsers(params?: { page?: number; limit?: number }): Promise<ListUsersResponse> {
    const search = new URLSearchParams();
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.limit != null) search.set('limit', String(params.limit));
    const q = search.toString();
    return httpClient.get<ListUsersResponse>(`${ADMIN}${q ? `?${q}` : ''}`);
  },

  searchUsers(q: string, params?: { page?: number; limit?: number }): Promise<ListUsersResponse> {
    const search = new URLSearchParams({ q });
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.limit != null) search.set('limit', String(params.limit));
    return httpClient.get<ListUsersResponse>(`${ADMIN}/search?${search.toString()}`);
  },

  createUser(body: CreateUserRequest): Promise<UserResponse> {
    return httpClient.post<UserResponse>(ADMIN, body);
  },

  updateUser(id: string, body: UpdateUserRequest): Promise<UserResponse> {
    return httpClient.put<UserResponse>(`${ADMIN}/${id}`, body);
  },

  deleteUser(id: string): Promise<void> {
    return httpClient.delete(`${ADMIN}/${id}`);
  },
};
