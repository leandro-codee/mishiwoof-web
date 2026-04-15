/**
 * Notifications HTTP Repository - /api/v1/notifications
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type { NotificationResponse } from '../../../application/dto/NotificationDTO';

const BASE = '/notifications';

export const notificationsApi = {
  list(params?: { page?: number; limit?: number }): Promise<NotificationResponse[]> {
    const search = new URLSearchParams();
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.limit != null) search.set('limit', String(params.limit));
    const q = search.toString();
    return httpClient.get<NotificationResponse[]>(`${BASE}${q ? `?${q}` : ''}`);
  },

  getUnread(): Promise<NotificationResponse[]> {
    return httpClient.get<NotificationResponse[]>(`${BASE}/unread`);
  },

  getUnreadCount(): Promise<{ count: number }> {
    return httpClient.get<{ count: number }>(`${BASE}/unread/count`);
  },

  markAsRead(id: string): Promise<void> {
    return httpClient.patch(`${BASE}/${id}/read`);
  },

  markAllAsRead(): Promise<void> {
    return httpClient.patch(`${BASE}/read-all`);
  },
};
