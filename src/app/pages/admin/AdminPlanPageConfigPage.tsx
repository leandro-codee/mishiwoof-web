/**
 * AdminPlanPageConfigPage — /admin/planes/:id/pagina
 *
 * Editor de la configuración visible en /planes/:id: imagen hero, nota del tope
 * anual, y botón CTA. Sube archivos reutilizando POST /files.
 */

import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlan, usePlanPageConfig, useSavePlanPageConfig } from '@modules/plans/presentation/hooks/usePlans';
import { assetsApi } from '@modules/assets/infrastructure/repositories/http/AssetsHttpRepository';
import { ExternalLink, ImagePlus, Loader2, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminPlanPageConfigPage() {
  const { id: planId } = useParams<{ id: string }>();
  const { data: plan } = usePlan(planId, false);
  const { data: config, isLoading } = usePlanPageConfig(planId);
  const saveMutation = useSavePlanPageConfig();

  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [annualCapNote, setAnnualCapNote] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate form when config loads
  useEffect(() => {
    if (!config) return;
    setHeroImageUrl(config.heroImageUrl);
    setAnnualCapNote(config.annualCapNote);
    setCtaUrl(config.ctaUrl);
    setCtaText(config.ctaText);
    setDirty(false);
  }, [config]);

  const markDirty = () => setDirty(true);

  const handleFile = async (file: File | null | undefined) => {
    if (!file || !planId) return;
    try {
      setUploading(true);
      const asset = await assetsApi.upload(file, 'hero_image', ['plan-hero', `plan-${planId}`]);
      setHeroImageUrl(asset.url);
      markDirty();
      toast.success('Imagen subida. Recuerda guardar cambios.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!planId) return;
    saveMutation.mutate(
      {
        planId,
        data: {
          heroImageUrl,
          annualCapNote,
          ctaUrl,
          ctaText,
        },
      },
      { onSuccess: () => setDirty(false) },
    );
  };

  const handleRemoveImage = () => {
    setHeroImageUrl(null);
    markDirty();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Configuración de página
          </h1>
          {dirty && (
            <span
              className="h-2.5 w-2.5 rounded-full bg-orange-500"
              title="Tienes cambios sin guardar"
            />
          )}
        </div>
        <p className="text-sm text-gray-500">
          Plan: <span className="font-medium text-gray-800">{plan?.name ?? '—'}</span>
        </p>
      </div>

      {/* Hero image uploader */}
      <section className="mb-8">
        <Label className="mb-2 block">Imagen de fondo (hero)</Label>
        <p className="text-xs text-gray-500 mb-3">Dimensión recomendada: 1440×300 px. JPG/PNG/WebP.</p>

        <div
          className="relative flex h-56 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
        >
          {heroImageUrl ? (
            <>
              <img
                src={heroImageUrl}
                alt="Hero preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-3">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  <span className="ml-1.5">Cambiar</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveImage}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-1.5">Quitar</span>
                </Button>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <ImagePlus className="h-8 w-8" />
              )}
              <span className="text-sm font-medium">
                {uploading ? 'Subiendo…' : 'Arrastra una imagen o haz click para seleccionar'}
              </span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </section>

      {/* Annual cap note */}
      <section className="mb-6">
        <Label htmlFor="annualCapNote" className="mb-2 block">
          Texto de nota del tope anual
        </Label>
        <Textarea
          id="annualCapNote"
          value={annualCapNote}
          rows={5}
          onChange={(e) => {
            setAnnualCapNote(e.target.value);
            markDirty();
          }}
          placeholder="Si la mascota gasta este saldo antes de cumplir el año…"
        />
      </section>

      {/* CTA */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ctaUrl" className="mb-2 block">
            URL del botón CTA
          </Label>
          <Input
            id="ctaUrl"
            value={ctaUrl}
            onChange={(e) => {
              setCtaUrl(e.target.value);
              markDirty();
            }}
            placeholder="https://mishiwoof.cl/contratar"
          />
        </div>
        <div>
          <Label htmlFor="ctaText" className="mb-2 block">
            Texto del botón CTA
          </Label>
          <Input
            id="ctaText"
            value={ctaText}
            onChange={(e) => {
              setCtaText(e.target.value);
              markDirty();
            }}
            placeholder="¡Contratar plan aquí!"
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
        {planId && (
          <Button asChild variant="outline">
            <Link to={`/planes/${planId}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="ml-1.5">Ver página pública</span>
            </Link>
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!dirty || saveMutation.isPending}
          className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">Guardar cambios</span>
        </Button>
      </div>
    </div>
  );
}
