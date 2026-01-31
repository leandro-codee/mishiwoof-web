/**
 * useChat - threads, messages
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../../infrastructure/repositories/http/ChatHttpRepository';

export const chatKeys = {
  all: ['chat'] as const,
  threads: () => [...chatKeys.all, 'threads'] as const,
  thread: (id: string) => [...chatKeys.all, 'thread', id] as const,
  messages: (threadId: string) => [...chatKeys.all, 'messages', threadId] as const,
};

export function useChatThreads() {
  return useQuery({
    queryKey: chatKeys.threads(),
    queryFn: () => chatApi.listThreads(),
  });
}

export function useChatThread(id: string | undefined | null) {
  return useQuery({
    queryKey: chatKeys.thread(id ?? ''),
    queryFn: () => chatApi.getThread(id!),
    enabled: !!id,
  });
}

export function useChatMessages(threadId: string | undefined | null) {
  return useQuery({
    queryKey: chatKeys.messages(threadId ?? ''),
    queryFn: () => chatApi.getMessages(threadId!),
    enabled: !!threadId,
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: chatApi.createThread.bind(chatApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.threads() }),
  });
}

export function useSendMessage(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof chatApi.sendMessage>[1]) => chatApi.sendMessage(threadId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.messages(threadId) }),
  });
}
