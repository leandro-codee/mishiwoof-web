import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getFileDownloadURL } from '@modules/assets/infrastructure/repositories/http/AssetsHttpRepository';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  useAssets,
  useAssetTags,
  useUploadAsset,
  useUpdateAsset,
  useDeleteAsset,
} from '@modules/assets/presentation/hooks/useAssets';
import type { Asset } from '@modules/assets/application/dto/AssetDTO';
import { PdfViewer } from '@app/components/PdfViewer';
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Tag,
  Loader2,
  Image as ImageIcon,
  X,
  Plus,
  FileText,
  Eye,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

const ASSET_TYPES_FILTER = [
  { value: 'all', label: 'Todos' },
  { value: 'logo', label: 'Logo' },
  { value: 'hero_image', label: 'Hero Image' },
  { value: 'plan_image', label: 'Imagen de Plan' },
  { value: 'pdf', label: 'PDF' },
  { value: 'general', label: 'General' },
];

const ASSET_TYPES_UPLOAD = [
  { value: 'logo', label: 'Logo' },
  { value: 'hero_image', label: 'Hero Image' },
  { value: 'plan_image', label: 'Imagen de Plan' },
  { value: 'pdf', label: 'PDF' },
  { value: 'general', label: 'General' },
];

export function AdminAssetsPage() {
  const [assetType, setAssetType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [search, setSearch] = useState('');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [uploadType, setUploadType] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useAssets({
    file_type: assetType === 'all' ? undefined : assetType,
    tag: selectedTag || undefined,
    search: search || undefined,
    limit: 100,
  });

  const { data: tags } = useAssetTags();
  const uploadMutation = useUploadAsset();
  const updateMutation = useUpdateAsset();
  const deleteMutation = useDeleteAsset();

  const handleUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      await uploadMutation.mutateAsync({
        file,
        assetType: uploadType,
        tags: [],
      });
    }
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast.success('Path copiado al portapapeles');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isPdf = (asset: Asset) => asset.contentType === 'application/pdf';
  const isImage = (asset: Asset) => asset.contentType.startsWith('image/');

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Archivos</h1>
          <p className="text-gray-600 mt-1">
            Administra logos, imágenes, PDFs y archivos del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={uploadType} onValueChange={setUploadType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES_UPLOAD.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Subir archivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={assetType} onValueChange={setAssetType}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {ASSET_TYPES_FILTER.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {data && (
          <span className="text-sm text-gray-500">{data.total} resultados</span>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
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

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : data?.files && data.files.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data.files.map((asset) => (
            <ContextMenu key={asset.id}>
              <ContextMenuTrigger>
                <Card className="group hover:shadow-lg transition-shadow overflow-hidden cursor-context-menu">
                  <div className="aspect-square relative bg-gray-50">
                    {isImage(asset) ? (
                      <img
                        src={getFileDownloadURL(asset.id)}
                        alt={asset.altText || asset.originalFilename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <FileText className="h-12 w-12 text-gray-300" />
                        {isPdf(asset) && (
                          <span className="text-xs text-gray-400">PDF</span>
                        )}
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPreviewAsset(asset)}
                        title="Previsualizar"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingAsset(asset)}
                        title="Editar tags"
                      >
                        <Tag className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-medium truncate" title={asset.originalFilename}>
                      {asset.originalFilename}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{formatSize(asset.sizeBytes)}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {asset.fileType}
                      </Badge>
                    </div>
                    {asset.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {asset.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => setPreviewAsset(asset)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Previsualizar
                </ContextMenuItem>
                <ContextMenuItem asChild>
                  <a href={getFileDownloadURL(asset.id)} download={asset.originalFilename}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </a>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleCopyPath(asset.path)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar path
                </ContextMenuItem>
                <ContextMenuItem onClick={() => setEditingAsset(asset)}>
                  <Tag className="h-4 w-4 mr-2" />
                  Editar tags
                </ContextMenuItem>
                <ContextMenuItem
                  className="text-red-600"
                  onClick={() => deleteMutation.mutate(asset.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <ImageIcon className="h-16 w-16 mb-4" />
          <p className="text-lg">No hay archivos</p>
          <p className="text-sm mt-1">Sube tu primer archivo con el botón de arriba</p>
        </div>
      )}

      {/* Preview Dialog — full-width responsive */}
      {previewAsset && (
        <Dialog open onOpenChange={(v) => !v && setPreviewAsset(null)}>
          <DialogContent className="w-[95vw] max-w-7xl h-[95vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="shrink-0">
              <div className="flex items-center justify-between gap-4">
                <DialogTitle className="truncate text-base sm:text-lg">
                  {previewAsset.originalFilename}
                </DialogTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {previewAsset.fileType}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {formatSize(previewAsset.sizeBytes)}
                  </Badge>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-auto flex items-center justify-center min-h-0 bg-gray-50 rounded-lg">
              {isPdf(previewAsset) ? (
                <div className="w-full h-full flex items-start justify-center overflow-auto p-4">
                  <PdfViewer
                    url={getFileDownloadURL(previewAsset.id)}
                    width={Math.min(900, typeof window !== 'undefined' ? window.innerWidth - 120 : 900)}
                  />
                </div>
              ) : isImage(previewAsset) ? (
                <img
                  src={getFileDownloadURL(previewAsset.id)}
                  alt={previewAsset.altText || previewAsset.originalFilename}
                  className="max-w-full max-h-full object-contain p-4"
                />
              ) : (
                <p className="text-gray-400">Vista previa no disponible</p>
              )}
            </div>
            <div className="flex justify-between items-center pt-3 border-t shrink-0">
              <p className="text-xs text-gray-400 truncate max-w-[50%]">
                {previewAsset.path}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={getFileDownloadURL(previewAsset.id)} download={previewAsset.originalFilename}>
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreviewAsset(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Tags Dialog */}
      {editingAsset && (
        <EditAssetDialog
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={(editTags, altText, fileTypeVal) => {
            updateMutation.mutate({
              id: editingAsset.id,
              data: { tags: editTags, altText, fileType: fileTypeVal },
            });
            setEditingAsset(null);
          }}
        />
      )}
    </div>
  );
}

function EditAssetDialog({
  asset,
  onClose,
  onSave,
}: {
  asset: Asset;
  onClose: () => void;
  onSave: (tags: string[], altText: string | null, fileType: string) => void;
}) {
  const [tags, setTags] = useState<string[]>(asset.tags);
  const [newTag, setNewTag] = useState('');
  const [altText, setAltText] = useState(asset.altText || '');
  const [fileType, setFileType] = useState(asset.fileType);

  const handleAddTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar archivo</DialogTitle>
        </DialogHeader>

        {asset.contentType.startsWith('image/') && (
          <img
            src={getFileDownloadURL(asset.id)}
            alt={asset.originalFilename}
            className="w-full h-40 object-contain bg-gray-50 rounded-lg"
          />
        )}

        <div>
          <label className="text-sm font-medium">Tipo</label>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES_UPLOAD.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Texto alternativo</label>
          <Input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Descripción de la imagen"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tags</label>
          <div className="flex gap-2 mt-1">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nuevo tag"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button variant="outline" size="sm" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
            onClick={() => onSave(tags, altText || null, fileType)}
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
