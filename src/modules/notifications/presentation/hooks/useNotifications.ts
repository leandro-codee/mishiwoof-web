/**
 * useNotifications - list, unread count, mark as read
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../infrastructure/repositories/http/NotificationsHttpRepository';

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: (page?: number, limit?: number) => [...notificationsKeys.all, 'list', page, limit] as const,
  unread: () => [...notificationsKeys.all, 'unread'] as const,
  unreadCount: () => [...notificationsKeys.all, 'unread-count'] as const,
};

export function useNotificationsList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: notificationsKeys.list(params?.page, params?.limit),
    queryFn: () => notificationsApi.list(params),
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: notificationsKeys.unread(),
    queryFn: () => notificationsApi.getUnread(),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKeys.all }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKeys.all }),
  });
}
