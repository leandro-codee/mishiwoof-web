/**
 * useAuth - login, register, logout and auth state from store
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authStore } from '@shared/infrastructure/auth/auth.store';
import { authApi, loginAndStore, registerAndStore } from '../../infrastructure/repositories/http/AuthHttpRepository';
import type { LoginRequest, RegisterRequest } from '../../application/dto/AuthDTO';

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (body: LoginRequest) => loginAndStore(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
  });

  const registerMutation = useMutation({
    mutationFn: (body: RegisterRequest) => registerAndStore(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => queryClient.clear(),
  });

  const requestPasswordResetMutation = useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset({ email }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (args: { token: string; newPassword: string }) =>
      authApi.resetPassword({ token: args.token, newPassword: args.newPassword }),
  });

  return {
    user: authStore.user,
    accessToken: authStore.accessToken,
    isAuthenticated: !!authStore.getAccessToken(),
    login: loginMutation.mutateAsync,
    loginMutation,
    register: registerMutation.mutateAsync,
    registerMutation,
    logout: () => logoutMutation.mutate(),
    logoutMutation,
    requestPasswordReset: requestPasswordResetMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
  };
}
