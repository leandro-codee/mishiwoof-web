/**
 * usePets - list, get, create, update, delete pets
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsApi } from '../../infrastructure/repositories/http/PetsHttpRepository';

export const petsKeys = {
  all: ['pets'] as const,
  list: () => [...petsKeys.all, 'list'] as const,
  detail: (id: string) => [...petsKeys.all, id] as const,
};

export function usePetsList() {
  return useQuery({
    queryKey: petsKeys.list(),
    queryFn: () => petsApi.list(),
  });
}

export function usePet(id: string | undefined | null) {
  return useQuery({
    queryKey: petsKeys.detail(id ?? ''),
    queryFn: () => petsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreatePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: petsApi.create.bind(petsApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: petsKeys.all }),
  });
}

export function useUpdatePet(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof petsApi.update>[1]) => petsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: petsKeys.all });
      qc.invalidateQueries({ queryKey: petsKeys.detail(id) });
    },
  });
}

export function useDeletePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: petsApi.delete.bind(petsApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: petsKeys.all }),
  });
}

export function useUploadPetPhoto(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => petsApi.uploadPhoto(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: petsKeys.all });
      qc.invalidateQueries({ queryKey: petsKeys.detail(id) });
    },
  });
}
