// src/app/pages/admin/EditarPlanPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  usePlan,
  useUpdatePlan,
  useBulkUpdateCoverages,
  useCoverageTypes,
  useUploadPlanImage,
} from '@modules/plans/presentation/hooks/usePlans';
import { Camera, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { CoverageInput } from '@modules/plans/application/dto/PlanDTO';

export default function EditarPlanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading } = usePlan(id, true);
  const { data: coverageTypes } = useCoverageTypes();
  const updatePlanMutation = useUpdatePlan();
  const updateCoveragesMutation = useBulkUpdateCoverages();
  const uploadImageMutation = useUploadPlanImage();

  // State para datos del plan
  const [planData, setPlanData] = useState({
    name: '',
    description: '',
    basePriceUf: 0,
    color: '',
    stars: 0,
    isActive: false,
    isPublished: false,
    hasDental: false,
    hasPreventive: false,
    deductibleUf: 0,
    maxAnnualCoverageUf: undefined as number | undefined,
  });

  // State para coberturas (edición inline)
  const [coverages, setCoverages] = useState<CoverageInput[]>([]);

  // Inicializar datos cuando se carga el plan
  useEffect(() => {
    if (plan) {
      setPlanData({
        name: plan.name,
        description: plan.description || '',
        basePriceUf: plan.basePriceUf,
        color: plan.color || '',
        stars: plan.stars || 0,
        isActive: plan.isActive,
        isPublished: plan.isPublished,
        hasDental: plan.hasDental,
        hasPreventive: plan.hasPreventive,
        deductibleUf: plan.deductibleUf,
        maxAnnualCoverageUf: plan.maxAnnualCoverageUf,
      });

      // Inicializar coberturas existentes
      if (plan.coverages) {
        setCoverages(
          plan.coverages.map((c) => ({
            id: c.id,
            coverageTypeId: c.coverageTypeId,
            benefitId: c.benefitId,
            coveragePercentage: c.coveragePercentage,
            maxAmountPerEventUf: c.maxAmountPerEventUf,
            maxAnnualEvents: c.maxAnnualEvents,
            disclaimer: c.disclaimer,
          }))
        );
      }
    }
  }, [plan]);

  // Handlers
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
    value: any
  ) => {
    setCoverages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) {
      await uploadImageMutation.mutateAsync({ planId: id, file });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Plan no encontrado</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/planes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <p className="text-gray-500">
              Valor: {plan.basePriceUf} UF / {formatCurrency(plan.basePriceCLP)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {plan.isPublished && <Badge variant="default">Publicado</Badge>}
          {plan.isActive && <Badge className="bg-green-500">Activo</Badge>}
          <Button onClick={handlePlanUpdate} disabled={updatePlanMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="coverages">Coberturas</TabsTrigger>
        </TabsList>

        {/* TAB 1: General Info */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Plan *</Label>
                  <Input
                    id="name"
                    value={planData.name}
                    onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="basePriceUf">Precio Base (UF) *</Label>
                  <Input
                    id="basePriceUf"
                    type="number"
                    step="0.01"
                    value={planData.basePriceUf}
                    onChange={(e) =>
                      setPlanData({ ...planData, basePriceUf: parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color del Plan</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={planData.color}
                      onChange={(e) => setPlanData({ ...planData, color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={planData.color}
                      onChange={(e) => setPlanData({ ...planData, color: e.target.value })}
                      placeholder="#10b981"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stars">Estrellas</Label>
                  <Input
                    id="stars"
                    type="number"
                    min="0"
                    max="5"
                    value={planData.stars}
                    onChange={(e) =>
                      setPlanData({ ...planData, stars: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="deductibleUf">Deducible (UF)</Label>
                  <Input
                    id="deductibleUf"
                    type="number"
                    step="0.01"
                    value={planData.deductibleUf}
                    onChange={(e) =>
                      setPlanData({ ...planData, deductibleUf: parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="maxAnnualCoverageUf">Cobertura Anual Máxima (UF)</Label>
                  <Input
                    id="maxAnnualCoverageUf"
                    type="number"
                    step="0.01"
                    value={planData.maxAnnualCoverageUf || ''}
                    onChange={(e) =>
                      setPlanData({
                        ...planData,
                        maxAnnualCoverageUf: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={planData.description}
                  onChange={(e) => setPlanData({ ...planData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Switches */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Plan Activo</Label>
                  <Switch
                    id="isActive"
                    checked={planData.isActive}
                    onCheckedChange={(checked) => setPlanData({ ...planData, isActive: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublished">Plan Publicado</Label>
                  <Switch
                    id="isPublished"
                    checked={planData.isPublished}
                    onCheckedChange={(checked) => setPlanData({ ...planData, isPublished: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="hasDental">Incluye Dental</Label>
                  <Switch
                    id="hasDental"
                    checked={planData.hasDental}
                    onCheckedChange={(checked) => setPlanData({ ...planData, hasDental: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="hasPreventive">Incluye Preventivo</Label>
                  <Switch
                    id="hasPreventive"
                    checked={planData.hasPreventive}
                    onCheckedChange={(checked) => setPlanData({ ...planData, hasPreventive: checked })}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Imagen del Plan</Label>
                <div className="flex items-center gap-4 mt-2">
                  {plan.imageUrl && (
                    <img
                      src={plan.imageUrl}
                      alt={plan.name}
                      className="w-32 h-32 rounded-lg object-cover border"
                    />
                  )}
                  <label htmlFor="image-upload">
                    <Button variant="outline" type="button" asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        Cambiar Imagen
                      </span>
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Coverages (⭐ EDITOR INLINE) */}
        <TabsContent value="coverages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Coberturas del Plan</CardTitle>
              <Button onClick={handleCoveragesUpdate} disabled={updateCoveragesMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Coberturas
              </Button>
            </CardHeader>
            <CardContent>
              {/* ⭐ TABLA EDITABLE INLINE */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#1a4d2e] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Prestación</th>
                      <th className="px-4 py-3 text-center w-32">Cobertura</th>
                      <th className="px-4 py-3 text-center w-40">Tope por evento</th>
                      <th className="px-4 py-3 text-center w-32">Eventos por año</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverages.map((coverage, index) => {
                      const coverageType = coverageTypes?.find(
                        (ct) => ct.id === coverage.coverageTypeId
                      );

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          {/* Prestación (nombre del coverage type) */}
                          <td className="px-4 py-3">{coverageType?.name || 'N/A'}</td>

                          {/* Cobertura % (editable) */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={coverage.coveragePercentage || 0}
                                onChange={(e) =>
                                  handleCoverageChange(
                                    index,
                                    'coveragePercentage',
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-20 text-center"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </td>

                          {/* Tope UF (editable) */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={coverage.maxAmountPerEventUf || 0}
                                onChange={(e) =>
                                  handleCoverageChange(
                                    index,
                                    'maxAmountPerEventUf',
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-24 text-center"
                              />
                              <span className="text-sm text-gray-500">UF</span>
                            </div>
                          </td>

                          {/* Eventos anuales (editable) */}
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              value={coverage.maxAnnualEvents || 0}
                              onChange={(e) =>
                                handleCoverageChange(
                                  index,
                                  'maxAnnualEvents',
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-20 text-center mx-auto"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
