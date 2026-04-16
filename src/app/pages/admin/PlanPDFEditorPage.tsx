import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlan } from '@modules/plans/presentation/hooks/usePlans';
import {
  usePlanPDFConfig,
  useSavePDFConfig,
  useGeneratePDF,
} from '@modules/plan-pdf/presentation/hooks/usePlanPDF';
import { AssetPickerDialog } from '@modules/assets/presentation/components/AssetPickerDialog';
import { getFileDownloadURL, getPlanPDFDownloadURL } from '@modules/assets/infrastructure/repositories/http/AssetsHttpRepository';
import { ArrowLeft, FileText, ExternalLink, Download, Loader2, X, ImagePlus } from 'lucide-react';

export default function PlanPDFEditorPage() {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading: planLoading } = usePlan(planId, false);
  const { data: savedConfig, isLoading: configLoading } = usePlanPDFConfig(planId);

  const saveMutation = useSavePDFConfig();
  const generateMutation = useGeneratePDF();

  // Local state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState('#2E8B7A');
  const [footerText, setFooterText] = useState('www.mishiwoof.cl');
  const [showUfValue, setShowUfValue] = useState(true);
  const [customTitle, setCustomTitle] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Asset picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'logo' | 'hero_image'>('logo');

  // Sync from server config once loaded
  useEffect(() => {
    if (savedConfig && !initialized) {
      setLogoUrl(savedConfig.logoUrl);
      setHeroImageUrl(savedConfig.heroImageUrl);
      setAccentColor(savedConfig.accentColor || '#2E8B7A');
      setFooterText(savedConfig.footerText || 'www.mishiwoof.cl');
      setShowUfValue(savedConfig.showUfValue);
      setCustomTitle(savedConfig.customTitle || '');
      setInitialized(true);
    }
  }, [savedConfig, initialized]);

  const openPicker = (target: 'logo' | 'hero_image') => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  const handleGenerate = async () => {
    if (!planId) return;

    await saveMutation.mutateAsync({
      planId,
      config: {
        logoUrl,
        heroImageUrl,
        accentColor,
        footerText,
        showUfValue,
        customTitle: customTitle || null,
      },
    });

    await generateMutation.mutateAsync({
      planId,
      config: {
        logo_url: logoUrl || '',
        hero_image_url: heroImageUrl || '',
        accent_color: accentColor,
        footer_text: footerText,
        show_uf_value: showUfValue,
        custom_title: customTitle || null,
      },
    });
  };

  if (planLoading || configLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Plan no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/planes')}>
          Volver a Planes
        </Button>
      </div>
    );
  }

  // If plan has a PDF path stored, build the proxy download URL
  const hasPdf = !!plan.termsPdfUrl;
  const pdfDownloadUrl = hasPdf && planId ? getPlanPDFDownloadURL(planId) : null;
  const isGenerating = generateMutation.isPending || saveMutation.isPending;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/planes')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Generar PDF</h1>
          <p className="text-sm text-gray-500">{plan.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Configuration */}
        <div className="space-y-6">
          {/* Logo Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[#FF6F61] transition-colors relative"
                onClick={() => openPicker('logo')}
              >
                {logoUrl ? (
                  <div className="relative">
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="max-h-20 mx-auto object-contain"
                    />
                    <button
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogoUrl(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Seleccionar logo desde la biblioteca o subir nuevo
                    </p>
                    <p className="text-xs text-amber-500 mt-1">Solo PNG o JPEG (SVG no es compatible con PDFs)</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hero Image Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imagen Hero</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[#FF6F61] transition-colors relative"
                onClick={() => openPicker('hero_image')}
              >
                {heroImageUrl ? (
                  <div className="relative">
                    <img
                      src={heroImageUrl}
                      alt="Hero"
                      className="max-h-32 mx-auto object-contain"
                    />
                    <button
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroImageUrl(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Seleccionar imagen hero desde la biblioteca o subir nueva
                    </p>
                    <p className="text-xs text-amber-500 mt-1">Solo PNG o JPEG (SVG no es compatible con PDFs)</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="accentColor">Color de acento</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    id="accentColor"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#2E8B7A"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="footerText">Texto del footer</Label>
                <Input
                  id="footerText"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="www.mishiwoof.cl"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customTitle">Título personalizado (opcional)</Label>
                <Input
                  id="customTitle"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={plan.name}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showUfValue">Mostrar valor UF en CLP</Label>
                <Switch
                  id="showUfValue"
                  checked={showUfValue}
                  onCheckedChange={setShowUfValue}
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            className="w-full bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || !logoUrl || !heroImageUrl}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generar PDF
              </>
            )}
          </Button>

          {(!logoUrl || !heroImageUrl) && (
            <p className="text-xs text-amber-600 text-center">
              Selecciona logo e imagen hero para habilitar la generación
            </p>
          )}
        </div>

        {/* RIGHT: Preview */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Vista previa del PDF</CardTitle>
            </CardHeader>
            <CardContent>
              {pdfDownloadUrl ? (
                <div className="space-y-4">
                  <iframe
                    src={pdfDownloadUrl}
                    className="w-full h-[600px] rounded-lg border"
                    title="PDF Preview"
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pdfDownloadUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Abrir en nueva pestaña
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={pdfDownloadUrl} download>
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                  <FileText className="h-16 w-16 mb-4" />
                  <p className="text-sm">Aún no se ha generado un PDF para este plan</p>
                  <p className="text-xs mt-1">Configura las opciones y presiona "Generar PDF"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Asset Picker Dialog */}
      <AssetPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          // Use the proxy download URL — never expires (unlike signed URLs)
          const url = getFileDownloadURL(asset.id);
          if (pickerTarget === 'logo') {
            setLogoUrl(url);
          } else {
            setHeroImageUrl(url);
          }
        }}
        suggestedType={pickerTarget}
        title={pickerTarget === 'logo' ? 'Seleccionar logo' : 'Seleccionar imagen hero'}
      />
    </div>
  );
}
