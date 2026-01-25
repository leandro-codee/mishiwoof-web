/**
 * useExample Hook
 * 
 * React hook for Example module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exampleHttpRepository } from '../../infrastructure/repositories/http/ExampleHttpRepository';
import type { Example } from '../../domain/models/Example';

const QUERY_KEYS = {
  all: ['examples'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
};

export function useExamples() {
  return useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: () => exampleHttpRepository.findAll(),
  });
}

export function useExample(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => exampleHttpRepository.findById(id),
    enabled: !!id,
  });
}

export function useCreateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Example, 'id' | 'createdAt' | 'updatedAt'>) =>
      exampleHttpRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}

export function useUpdateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Example> }) =>
      exampleHttpRepository.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => exampleHttpRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}
