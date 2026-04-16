import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '../../infrastructure/repositories/http/AssetsHttpRepository';
import type { UpdateAssetRequest } from '../../application/dto/AssetDTO';
import { toast } from 'sonner';

export const assetsKeys = {
  all: ['assets'] as const,
  lists: () => [...assetsKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...assetsKeys.lists(), params] as const,
  detail: (id: string) => [...assetsKeys.all, 'detail', id] as const,
  tags: () => [...assetsKeys.all, 'tags'] as const,
};

export function useAssets(params?: {
  file_type?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: assetsKeys.list(params ?? {}),
    queryFn: () => assetsApi.list(params),
  });
}

export function useAssetTags() {
  return useQuery({
    queryKey: assetsKeys.tags(),
    queryFn: () => assetsApi.listTags(),
  });
}

export function useUploadAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      assetType,
      tags,
      altText,
    }: {
      file: File;
      assetType: string;
      tags: string[];
      altText?: string;
    }) => assetsApi.upload(file, assetType, tags, altText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.all });
      toast.success('Imagen subida exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al subir imagen');
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetRequest }) =>
      assetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.all });
      toast.success('Imagen actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar imagen');
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.all });
      toast.success('Imagen eliminada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar imagen');
    },
  });
}
