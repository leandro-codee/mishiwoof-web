/**
 * Chat HTTP Repository - /api/v1/chat
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type {
  ChatThreadResponse,
  ChatMessageResponse,
  CreateThreadRequest,
  SendMessageRequest,
} from '../../../application/dto/ChatDTO';

const BASE = '/chat';

export const chatApi = {
  createThread(body: CreateThreadRequest): Promise<ChatThreadResponse> {
    return httpClient.post<ChatThreadResponse>(`${BASE}/threads`, body);
  },

  listThreads(): Promise<ChatThreadResponse[]> {
    return httpClient.get<ChatThreadResponse[]>(`${BASE}/threads`);
  },

  getThread(id: string): Promise<ChatThreadResponse> {
    return httpClient.get<ChatThreadResponse>(`${BASE}/threads/${id}`);
  },

  sendMessage(threadId: string, body: SendMessageRequest): Promise<ChatMessageResponse> {
    return httpClient.post<ChatMessageResponse>(`${BASE}/threads/${threadId}/messages`, body);
  },

  getMessages(threadId: string): Promise<ChatMessageResponse[]> {
    return httpClient.get<ChatMessageResponse[]>(`${BASE}/threads/${threadId}/messages`);
  },
};
