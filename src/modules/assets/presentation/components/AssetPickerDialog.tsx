import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssets, useAssetTags, useUploadAsset } from '../hooks/useAssets';
import { Upload, Search, Check, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import type { Asset } from '../../application/dto/AssetDTO';
import { getFileDownloadURL } from '../../infrastructure/repositories/http/AssetsHttpRepository';

const FILE_TYPE_OPTIONS = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'logo', label: 'Logo' },
  { value: 'hero_image', label: 'Hero Image' },
  { value: 'plan_image', label: 'Imagen de Plan' },
  { value: 'pdf', label: 'PDF' },
  { value: 'general', label: 'General' },
];

interface AssetPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  /** Suggested file type for new uploads (does NOT filter the list) */
  suggestedType?: string;
  title?: string;
}

export function AssetPickerDialog({
  open,
  onClose,
  onSelect,
  suggestedType,
  title = 'Seleccionar archivo',
}: AssetPickerDialogProps) {
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show ALL files by default — no forced type filter
  const { data, isLoading } = useAssets({
    file_type: fileTypeFilter === 'all' ? undefined : fileTypeFilter,
    tag: selectedTag || undefined,
    search: search || undefined,
    limit: 100,
  });

  const { data: tags } = useAssetTags();
  const uploadMutation = useUploadAsset();

  const handleUpload = async (file: File) => {
    const asset = await uploadMutation.mutateAsync({
      file,
      assetType: suggestedType || 'general',
      tags: [],
    });
    onSelect(asset);
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedId || !data?.files) return;
    const asset = data.files.find((a) => a.id === selectedId);
    if (asset) {
      onSelect(asset);
      onClose();
    }
  };

  const isImage = (asset: Asset) => asset.contentType.startsWith('image/');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Filters row */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILE_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            Subir nueva
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedTag === '' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedTag('')}
            >
              Todos
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Count */}
        {data && (
          <p className="text-xs text-gray-400">{data.total} archivo{data.total !== 1 ? 's' : ''}</p>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : data?.files && data.files.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {data.files.map((asset) => (
                <button
                  key={asset.id}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                    selectedId === asset.id
                      ? 'border-[#FF6F61] ring-2 ring-[#FF6F61]/30'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedId(asset.id)}
                  onDoubleClick={() => {
                    onSelect(asset);
                    onClose();
                  }}
                >
                  {isImage(asset) ? (
                    <img
                      src={getFileDownloadURL(asset.id)}
                      alt={asset.altText || asset.originalFilename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-1">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <span className="text-[10px] text-gray-400 uppercase">{asset.fileType}</span>
                    </div>
                  )}
                  {selectedId === asset.id && (
                    <div className="absolute top-1 right-1 bg-[#FF6F61] text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  {/* File type badge */}
                  <div className="absolute top-1 left-1">
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 opacity-70">
                      {asset.fileType}
                    </Badge>
                  </div>
                  {/* Filename on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {asset.originalFilename}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <ImageIcon className="h-12 w-12 mb-2" />
              <p className="text-sm">No hay archivos</p>
              <p className="text-xs mt-1">Sube uno con el botón de arriba</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            Seleccionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
