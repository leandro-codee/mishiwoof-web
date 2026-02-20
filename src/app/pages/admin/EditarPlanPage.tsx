// src/app/pages/admin/EditarPlanPage.tsx
// Formulario alineado con tabla plans (name, price_uf, is_active, is_public, pdf_url, img_url, color, tier).
// Coberturas: agregar (desde coverages_type) o quitar; guardar hace upsert vía bulk.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  usePlan,
  useUpdatePlan,
  useBulkUpdateCoverages,
  useCoverageTypes,
  useUploadPlanImage,
  useUploadPlanTermsPDF,
} from '@modules/plans/presentation/hooks/usePlans';
import { Camera, Save, ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CoverageInput } from '@modules/plans/application/dto/PlanDTO';
import type { CoverageType } from '@modules/plans/application/dto/PlanDTO';

export default function EditarPlanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading } = usePlan(id, true);
  const { data: coverageTypes = [] } = useCoverageTypes();
  const updatePlanMutation = useUpdatePlan();
  const updateCoveragesMutation = useBulkUpdateCoverages();
  const uploadImageMutation = useUploadPlanImage();
  const uploadPdfMutation = useUploadPlanTermsPDF();

  const [planData, setPlanData] = useState({
    name: '',
    basePriceUf: 0,
    color: '',
    tier: '',
    isActive: true,
    isPublished: true,
  });

  const [coverages, setCoverages] = useState<CoverageInput[]>([]);
  const [addCoverageTypeId, setAddCoverageTypeId] = useState<string>('');

  useEffect(() => {
    if (plan) {
      setPlanData({
        name: plan.name,
        basePriceUf: plan.basePriceUf,
        color: plan.color || '',
        tier: plan.tier || '',
        isActive: plan.isActive,
        isPublished: plan.isPublished,
      });
      if (plan.coverages?.length) {
        setCoverages(
          plan.coverages.map((c) => ({
            id: c.id,
            coverageTypeId: c.coverageTypeId,
            benefitId: c.benefitId,
            coveragePercentage: c.coveragePercentage ?? 0,
            maxAmountPerEventUf: c.maxAmountPerEventUf,
            maxAnnualEvents: c.maxAnnualEvents,
            disclaimer: c.disclaimer,
          }))
        );
      } else {
        setCoverages([]);
      }
    }
  }, [plan]);

  const handlePlanUpdate = async () => {
    await updatePlanMutation.mutateAsync({
      planId: id!,
      data: planData,
    });
  };

  const handleCoveragesUpdate = async () => {
    await updateCoveragesMutation.mutateAsync({
      planId: id!,
      data: { coverages },
    });
  };

  const handleCoverageChange = (
    index: number,
    field: keyof CoverageInput,
    value: string | number | undefined
  ) => {
    setCoverages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const coverageTypeIdsInUse = coverages.map((c) => c.coverageTypeId);
  const availableCoverageTypes = coverageTypes.filter(
    (ct: CoverageType) => !coverageTypeIdsInUse.includes(ct.id)
  );

  const handleAddCoverage = () => {
    if (!addCoverageTypeId) return;
    setCoverages((prev) => [
      ...prev,
      {
        coverageTypeId: addCoverageTypeId,
        coveragePercentage: 0,
        maxAmountPerEventUf: undefined,
        maxAnnualEvents: undefined,
      },
    ]);
    setAddCoverageTypeId('');
  };

  const handleRemoveCoverage = (index: number) => {
    setCoverages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) await uploadImageMutation.mutateAsync({ planId: id, file });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) await uploadPdfMutation.mutateAsync({ planId: id, file });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Plan no encontrado</div>
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/planes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <p className="text-gray-500">
              {plan.basePriceUf} UF / {formatCurrency(plan.basePriceCLP)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plan.isPublished && <Badge variant="default">Publicado</Badge>}
          {plan.isActive && <Badge className="bg-green-500">Activo</Badge>}
          <Button onClick={handlePlanUpdate} disabled={updatePlanMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Guardar plan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Información general</TabsTrigger>
          <TabsTrigger value="coverages">Coberturas</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Datos del plan</CardTitle>
              <p className="text-sm text-muted-foreground">
                Campos según tabla plans: name, price_uf, is_active, is_public, pdf_url, img_url, color, tier.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del plan *</Label>
                  <Input
                    id="name"
                    value={planData.name}
                    onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="basePriceUf">Precio (UF) *</Label>
                  <Input
                    id="basePriceUf"
                    type="number"
                    step="0.01"
                    min={0}
                    value={planData.basePriceUf}
                    onChange={(e) =>
                      setPlanData({ ...planData, basePriceUf: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={planData.color || '#10b981'}
                      onChange={(e) => setPlanData({ ...planData, color: e.target.value })}
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={planData.color}
                      onChange={(e) => setPlanData({ ...planData, color: e.target.value })}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <Input
                    id="tier"
                    value={planData.tier}
                    onChange={(e) => setPlanData({ ...planData, tier: e.target.value })}
                    placeholder="Ej. básico, premium"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="isActive">Plan activo</Label>
                  <Switch
                    id="isActive"
                    checked={planData.isActive}
                    onCheckedChange={(c) => setPlanData({ ...planData, isActive: c })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="isPublished">Plan público (visible en web)</Label>
                  <Switch
                    id="isPublished"
                    checked={planData.isPublished}
                    onCheckedChange={(c) => setPlanData({ ...planData, isPublished: c })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Imagen del plan</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {plan.imageUrl && (
                      <img
                        src={plan.imageUrl}
                        alt={plan.name}
                        className="w-28 h-28 rounded-lg object-cover border"
                      />
                    )}
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          Cambiar imagen
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <Label>PDF de términos</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {plan.termsPdfUrl && (
                      <a
                        href={plan.termsPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline"
                      >
                        Ver PDF
                      </a>
                    )}
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <FileText className="h-4 w-4 mr-2" />
                          Subir PDF
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handlePdfUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Coberturas del plan</CardTitle>
              <Button
                onClick={handleCoveragesUpdate}
                disabled={updateCoveragesMutation.isPending || coverages.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar coberturas
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Agregar coberturas desde <strong>coverages_type</strong>. Quitar una fila la elimina del plan al guardar.
              </p>

              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[220px]">
                  <Label className="text-xs">Agregar tipo de cobertura</Label>
                  <Select value={addCoverageTypeId} onValueChange={setAddCoverageTypeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCoverageTypes.map((ct: CoverageType) => (
                        <SelectItem key={ct.id} value={ct.id}>
                          {ct.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddCoverage}
                  disabled={!addCoverageTypeId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar cobertura
                </Button>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full border-collapse">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium">Prestación</th>
                      <th className="px-3 py-2 text-center w-24">Cobertura %</th>
                      <th className="px-3 py-2 text-center w-28">Tope UF/evento</th>
                      <th className="px-3 py-2 text-center w-24">Eventos/año</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {coverages.map((coverage, index) => {
                      const ct = coverageTypes.find((t: CoverageType) => t.id === coverage.coverageTypeId);
                      return (
                        <tr key={`${coverage.coverageTypeId}-${index}`} className="border-t">
                          <td className="px-3 py-2">{ct?.name ?? coverage.coverageTypeId}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              className="w-20 text-center mx-auto"
                              value={coverage.coveragePercentage ?? ''}
                              onChange={(e) =>
                                handleCoverageChange(
                                  index,
                                  'coveragePercentage',
                                  e.target.value === '' ? undefined : parseFloat(e.target.value)
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type={!coverage.maxAmountPerEventUf ? "text" : "number"}
                              step="0.01"
                              min={0}
                              className="w-24 text-center mx-auto"
                              value={!coverage.maxAmountPerEventUf ? 'Sin Tope' : coverage.maxAmountPerEventUf}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleCoverageChange(
                                  index,
                                  'maxAmountPerEventUf',
                                  val === '' ? undefined : parseFloat(val)
                                );
                              }}
                              onFocus={(e) => {
                                if (!coverage.maxAmountPerEventUf) {
                                  e.target.select();
                                }
                              }}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              className="w-20 text-center mx-auto"
                              value={coverage.maxAnnualEvents ?? ''}
                              onChange={(e) =>
                                handleCoverageChange(
                                  index,
                                  'maxAnnualEvents',
                                  e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                                )
                              }
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveCoverage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {coverages.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">
                  No hay coberturas. Usa &quot;Agregar cobertura&quot; para elegir un tipo desde coverages_type.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
