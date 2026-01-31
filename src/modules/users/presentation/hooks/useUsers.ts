/**
 * useUsers - current user profile and admin users
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../infrastructure/repositories/http/UsersHttpRepository';

export const usersKeys = {
  me: ['users', 'me'] as const,
  list: (page?: number, limit?: number) => ['users', 'list', page, limit] as const,
  search: (q: string, page?: number, limit?: number) => ['users', 'search', q, page, limit] as const,
};

export function useMe() {
  return useQuery({
    queryKey: usersKeys.me,
    queryFn: () => usersApi.getMe(),
    retry: false,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateMe.bind(usersApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.me }),
  });
}

export function useUsersList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: usersKeys.list(params?.page, params?.limit),
    queryFn: () => usersApi.listUsers(params),
  });
}

export function useUsersSearch(q: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: usersKeys.search(q, params?.page, params?.limit),
    queryFn: () => usersApi.searchUsers(q, params),
    enabled: q.length >= 2,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.createUser.bind(usersApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof usersApi.updateUser>[1]) => usersApi.updateUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deleteUser.bind(usersApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
