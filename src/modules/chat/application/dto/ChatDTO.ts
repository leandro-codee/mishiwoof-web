/**
 * Chat DTOs - /api/v1/chat
 */

export interface ChatThreadResponse {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  related_claim_id?: string;
  related_subscription_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageResponse {
  id: string;
  thread_id: string;
  sender_id: string;
  message: string;
  attachments?: Record<string, unknown>;
  is_internal: boolean;
  created_at: string;
}

export interface CreateThreadRequest {
  subject: string;
  related_claim_id?: string;
  related_subscription_id?: string;
}

export interface SendMessageRequest {
  message: string;
  attachments?: Record<string, unknown>;
  is_internal?: boolean;
}
