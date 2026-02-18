// @ts-nocheck
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Separator } from '@components/ui/separator';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Plus, Trash2, Edit2, AlertCircle, Upload } from 'lucide-react';
import { CoverageEditorModal } from './CoverageEditorModal';
import { PricingRuleEditorModal } from './PricingRuleEditorModal';

// Schema para Tab 1: Información General
const generalInfoSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  basePriceUF: z.number().positive('El precio debe ser mayor a 0'),
  color: z.string().optional(),
  stars: z.number().min(1).max(5).optional(),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  hasDental: z.boolean().default(false),
  hasPreventive: z.boolean().default(false),
  deductibleUF: z.number().min(0).default(0),
  maxAnnualCoverageUF: z.number().positive().optional(),
});

type GeneralInfoValues = z.infer<typeof generalInfoSchema>;

interface Coverage {
  id: string;
  coverageTypeId: string;
  coverageTypeName: string;
  benefitId: string;
  benefitName: string;
  coveragePercentage: number;
  maxAmountPerEventUF?: number;
  maxAnnualEvents?: number;
  disclaimer?: string;
}

interface PricingRule {
  id: string;
  species: 'DOG' | 'CAT' | 'ALL';
  breed?: string;
  ageMin?: number;
  ageMax?: number;
  regionId?: string;
  regionName?: string;
  priceMultiplier: number;
  isSeniorDiscount: boolean;
  isLegacyCustomer: boolean;
}

interface Benefit {
  id: string;
  name: string;
  icon?: string;
}

interface PlanEditorProps {
  initialData?: {
    id?: string;
    generalInfo: Partial<GeneralInfoValues>;
    coverages: Coverage[];
    pricingRules: PricingRule[];
  };
  onSave: (data: {
    generalInfo: GeneralInfoValues;
    coverages: Coverage[];
    pricingRules: PricingRule[];
  }) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const PlanEditor = ({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: PlanEditorProps) => {
  const [activeTab, setActiveTab] = useState('general');
  const [coverages, setCoverages] = useState<Coverage[]>(initialData?.coverages || []);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(
    initialData?.pricingRules || []
  );
  const [coverageModalOpen, setCoverageModalOpen] = useState(false);
  const [editingCoverage, setEditingCoverage] = useState<Coverage | null>(null);
  const [pricingRuleModalOpen, setPricingRuleModalOpen] = useState(false);
  const [editingPricingRule, setEditingPricingRule] = useState<PricingRule | null>(null);
  const [termsPdfFile, setTermsPdfFile] = useState<File | null>(null);
  const [planImageFile, setPlanImageFile] = useState<File | null>(null);

  // TODO: Fetch benefits from API
  const benefits: Benefit[] = [
    { id: '1', name: 'Consultas Veterinarias', icon: 'stethoscope' },
    { id: '2', name: 'Exámenes y Diagnóstico', icon: 'microscope' },
    { id: '3', name: 'Medicamentos', icon: 'pill' },
    { id: '4', name: 'Vacunas y Prevención', icon: 'syringe' },
    { id: '5', name: 'Hospitalización', icon: 'bed' },
    { id: '6', name: 'Procedimientos', icon: 'scissors' },
    { id: '7', name: 'Dental', icon: 'tooth' },
  ];

  const form = useForm<GeneralInfoValues>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      name: '',
      description: '',
      basePriceUF: 0,
      color: '#10b981',
      stars: 5,
      isActive: true,
      isPublished: false,
      hasDental: false,
      hasPreventive: false,
      deductibleUF: 0,
      maxAnnualCoverageUF: undefined,
      ...initialData?.generalInfo,
    },
  });

  const handleSave = () => {
    const generalInfo = form.getValues();
    onSave({ generalInfo, coverages, pricingRules });
  };

  const handleAddCoverage = (coverage: Omit<Coverage, 'id'>) => {
    const newCoverage: Coverage = {
      ...coverage,
      id: `temp-${Date.now()}`,
    };
    setCoverages([...coverages, newCoverage]);
    setCoverageModalOpen(false);
  };

  const handleUpdateCoverage = (coverage: Coverage) => {
    setCoverages(coverages.map((c) => (c.id === coverage.id ? coverage : c)));
    setCoverageModalOpen(false);
    setEditingCoverage(null);
  };

  const handleDeleteCoverage = (id: string) => {
    setCoverages(coverages.filter((c) => c.id !== id));
  };

  const handleAddPricingRule = (rule: Omit<PricingRule, 'id'>) => {
    const newRule: PricingRule = {
      ...rule,
      id: `temp-${Date.now()}`,
    };
    setPricingRules([...pricingRules, newRule]);
    setPricingRuleModalOpen(false);
  };

  const handleUpdatePricingRule = (rule: PricingRule) => {
    setPricingRules(pricingRules.map((r) => (r.id === rule.id ? rule : r)));
    setPricingRuleModalOpen(false);
    setEditingPricingRule(null);
  };

  const handleDeletePricingRule = (id: string) => {
    setPricingRules(pricingRules.filter((r) => r.id !== id));
  };

  // Agrupar coberturas por beneficio
  const coveragesByBenefit = benefits.map((benefit) => ({
    benefit,
    coverages: coverages.filter((c) => c.benefitId === benefit.id),
  }));

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="coverages">Coberturas</TabsTrigger>
          <TabsTrigger value="pricing">Reglas de Precio</TabsTrigger>
        </TabsList>

        {/* TAB 1: INFORMACIÓN GENERAL */}
        <TabsContent value="general" className="space-y-6">
          <Form {...form}>
            <Card>
              <CardHeader>
                <CardTitle>Datos Básicos del Plan</CardTitle>
                <CardDescription>
                  Información general que se mostrará a los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Plan *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Pet Ultra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe las características principales del plan..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Precio Base */}
                  <FormField
                    control={form.control}
                    name="basePriceUF"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Base (UF) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.50"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormDescription>Precio mensual base en UF</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Color */}
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color del Plan</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="color" {...field} className="h-10 w-20" />
                          </FormControl>
                          <Input value={field.value} disabled className="flex-1" />
                        </div>
                        <FormDescription>Color para identificar el plan en la UI</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Estrellas */}
                  <FormField
                    control={form.control}
                    name="stars"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estrellas (1-5)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 5)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Deducible */}
                  <FormField
                    control={form.control}
                    name="deductibleUF"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deducible (UF)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cobertura Máxima Anual */}
                  <FormField
                    control={form.control}
                    name="maxAnnualCoverageUF"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cobertura Máx. Anual (UF)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="100"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber || undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Características */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Características</h3>

                  <FormField
                    control={form.control}
                    name="hasDental"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Incluye Cobertura Dental</FormLabel>
                          <FormDescription>
                            El plan cubre tratamientos dentales
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasPreventive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Incluye Medicina Preventiva</FormLabel>
                          <FormDescription>
                            El plan cubre vacunas y cuidados preventivos
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Estado */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Estado</h3>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Plan Activo</FormLabel>
                          <FormDescription>
                            Los planes inactivos no están disponibles para contratación
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Publicado</FormLabel>
                          <FormDescription>
                            Los planes publicados son visibles para todos los usuarios
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('isPublished') && (
                    <Alert variant="default" className="border-yellow-500 bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        ⚠️ Este plan será visible públicamente una vez guardado
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Separator />

                {/* Documentos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Documentos</h3>

                  {/* PDF de Términos */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Términos y Condiciones (PDF)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setTermsPdfFile(e.target.files?.[0] || null)}
                      />
                      {initialData?.generalInfo && (
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {termsPdfFile && (
                      <p className="text-sm text-green-600 mt-1">✓ {termsPdfFile.name}</p>
                    )}
                  </div>

                  {/* Imagen del Plan */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Imagen del Plan</label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPlanImageFile(e.target.files?.[0] || null)}
                      />
                      {initialData?.generalInfo && (
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {planImageFile && (
                      <p className="text-sm text-green-600 mt-1">✓ {planImageFile.name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Form>
        </TabsContent>

        {/* TAB 2: COBERTURAS - Continuará en siguiente mensaje... */}
        <TabsContent value="coverages" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Coberturas del Plan</h3>
              <p className="text-sm text-gray-600">
                Define qué servicios cubre este plan y en qué porcentaje
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingCoverage(null);
                setCoverageModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cobertura
            </Button>
          </div>

          {coveragesByBenefit.map(({ benefit, coverages: benefitCoverages }) => (
            <Card key={benefit.id}>
              <CardHeader className="bg-[#1a4d2e] text-white">
                <CardTitle className="text-base">{benefit.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {benefitCoverages.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin coberturas configuradas</p>
                ) : (
                  <div className="space-y-3">
                    {benefitCoverages.map((coverage) => (
                      <div
                        key={coverage.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{coverage.coverageTypeName}</p>
                          <p className="text-sm text-gray-600">
                            Cobertura: {coverage.coveragePercentage}%
                            {coverage.maxAmountPerEventUF &&
                              ` • Máx/Evento: ${coverage.maxAmountPerEventUF} UF`}
                            {coverage.maxAnnualEvents &&
                              ` • Máx/Año: ${coverage.maxAnnualEvents} eventos`}
                          </p>
                          {coverage.disclaimer && (
                            <p className="text-xs text-gray-500 mt-1">{coverage.disclaimer}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setEditingCoverage(coverage);
                              setCoverageModalOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteCoverage(coverage.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TAB 3: REGLAS DE PRECIO - Continuará... */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Reglas de Precio</h3>
              <p className="text-sm text-gray-600">
                Define ajustes al precio base según características de la mascota
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingPricingRule(null);
                setPricingRuleModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Regla
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {pricingRules.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Sin reglas de precio configuradas. El precio base se aplicará a todos.
                </p>
              ) : (
                <div className="space-y-3">
                  {pricingRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          {rule.species !== 'ALL' && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {rule.species === 'DOG' ? 'Perros' : 'Gatos'}
                            </span>
                          )}
                          {rule.breed && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {rule.breed}
                            </span>
                          )}
                          {(rule.ageMin || rule.ageMax) && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              Edad: {rule.ageMin || 0} - {rule.ageMax || '∞'}
                            </span>
                          )}
                          {rule.regionName && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {rule.regionName}
                            </span>
                          )}
                          {rule.isSeniorDiscount && (
                            <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">
                              Descuento Senior
                            </span>
                          )}
                          {rule.isLegacyCustomer && (
                            <span className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-700">
                              Cliente Legacy
                            </span>
                          )}
                        </div>
                        <p className="font-medium">
                          Multiplicador: {rule.priceMultiplier}x
                          <span className="text-sm text-gray-600 ml-2">
                            ({rule.priceMultiplier > 1 ? '+' : ''}
                            {((rule.priceMultiplier - 1) * 100).toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setEditingPricingRule(rule);
                            setPricingRuleModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeletePricingRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botones de acción */}
      <div className="flex gap-4 justify-end pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Guardando...' : initialData?.id ? 'Actualizar Plan' : 'Crear Plan'}
        </Button>
      </div>

      {/* Modales */}
      <CoverageEditorModal
        open={coverageModalOpen}
        onOpenChange={setCoverageModalOpen}
        planId={initialData?.id || ''}
        coverage={editingCoverage}
        onSave={editingCoverage ? handleUpdateCoverage : handleAddCoverage}
      />

      <PricingRuleEditorModal
        open={pricingRuleModalOpen}
        onOpenChange={setPricingRuleModalOpen}
        planId={initialData?.id || ''}
        rule={editingPricingRule}
        onSave={editingPricingRule ? handleUpdatePricingRule : handleAddPricingRule}
      />
    </div>
  );
};
