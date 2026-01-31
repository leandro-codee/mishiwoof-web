/**
 * Notifications DTOs - /api/v1/notifications
 */

export interface NotificationResponse {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}
