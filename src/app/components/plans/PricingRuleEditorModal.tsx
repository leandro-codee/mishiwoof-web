// @ts-nocheck
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Checkbox } from '@components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Card } from '@components/ui/card';

const pricingRuleSchema = z.object({
  species: z.enum(['DOG', 'CAT', 'ALL']).default('ALL'),
  breed: z.string().optional(),
  ageMin: z.number().int().min(0).optional(),
  ageMax: z.number().int().min(0).optional(),
  regionId: z.string().optional(),
  priceMultiplier: z.number().positive('Debe ser mayor a 0'),
  isSeniorDiscount: z.boolean().default(false),
  isLegacyCustomer: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.ageMin && data.ageMax) {
      return data.ageMax >= data.ageMin;
    }
    return true;
  },
  {
    message: 'La edad máxima debe ser mayor o igual a la mínima',
    path: ['ageMax'],
  }
);

type PricingRuleValues = z.infer<typeof pricingRuleSchema>;

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

interface Region {
  id: string;
  name: string;
}

interface PricingRuleEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  rule?: PricingRule | null;
  onSave: (data: any) => void | Promise<void>;
  isLoading?: boolean;
}

export const PricingRuleEditorModal = ({
  open,
  onOpenChange,
  rule,
  onSave,
  isLoading = false,
}: PricingRuleEditorModalProps) => {
  const form = useForm<PricingRuleValues>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      species: rule?.species || 'ALL',
      breed: rule?.breed || '',
      ageMin: rule?.ageMin,
      ageMax: rule?.ageMax,
      regionId: rule?.regionId || '',
      priceMultiplier: rule?.priceMultiplier || 1.0,
      isSeniorDiscount: rule?.isSeniorDiscount || false,
      isLegacyCustomer: rule?.isLegacyCustomer || false,
    },
  });

  const watchSpecies = form.watch('species');
  const watchPriceMultiplier = form.watch('priceMultiplier');

  // TODO: Fetch regions from API
  const { data: regions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: async () => {
      return [
        { id: '1', name: 'Región Metropolitana' },
        { id: '2', name: 'Región de Valparaíso' },
        { id: '3', name: 'Región del Biobío' },
      ];
    },
  });

  // Razas comunes por especie
  const dogBreeds = [
    'Labrador Retriever',
    'Golden Retriever',
    'Pastor Alemán',
    'Bulldog Francés',
    'Beagle',
    'Chihuahua',
  ];

  const catBreeds = [
    'Persa',
    'Siamés',
    'Maine Coon',
    'Británico de Pelo Corto',
    'Ragdoll',
  ];

  const availableBreeds =
    watchSpecies === 'DOG' ? dogBreeds : watchSpecies === 'CAT' ? catBreeds : [];

  const calculatePercentage = (multiplier: number): string => {
    const percentage = (multiplier - 1) * 100;
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const exampleCalculation = (basePrice: number = 0.5): string => {
    const finalPrice = basePrice * watchPriceMultiplier;
    return `${basePrice} UF × ${watchPriceMultiplier} = ${finalPrice.toFixed(3)} UF`;
  };

  const handleSubmit = async (data: PricingRuleValues) => {
    const selectedRegion = regions.find((r) => r.id === data.regionId);

    await onSave({
      ...data,
      id: rule?.id,
      regionName: selectedRegion?.name,
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Editar Regla de Precio' : 'Agregar Regla de Precio'}
          </DialogTitle>
          <DialogDescription>
            Define condiciones y ajustes de precio para segmentos específicos
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* SECCIÓN: Condiciones */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Condiciones (cuándo aplica esta regla)</h3>

              {/* Especie */}
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">Todas las especies</SelectItem>
                        <SelectItem value="DOG">Solo Perros</SelectItem>
                        <SelectItem value="CAT">Solo Gatos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Raza */}
              {watchSpecies !== 'ALL' && (
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raza (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas las razas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Todas las razas</SelectItem>
                          {availableBreeds.map((breed) => (
                            <SelectItem key={breed} value={breed}>
                              {breed}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Dejar vacío para todas las razas</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Rango de Edad */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ageMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad Mínima (años)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>0 = sin mínimo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad Máxima (años)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="∞"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>Vacío = sin máximo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Región */}
              <FormField
                control={form.control}
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Región (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las regiones" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Todas las regiones</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Dejar vacío para todas las regiones</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Checkboxes especiales */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="isSeniorDiscount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Descuento Senior</FormLabel>
                        <FormDescription>
                          Aplica solo a mascotas senior (8+ años)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isLegacyCustomer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cliente Legacy</FormLabel>
                        <FormDescription>
                          Aplica solo a clientes antiguos (beneficio especial)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* SECCIÓN: Ajuste de Precio */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Ajuste de Precio</h3>

              <FormField
                control={form.control}
                name="priceMultiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Multiplicador de Precio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        placeholder="1.0000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      El precio base se multiplicará por este valor.
                      <br />
                      1.0000 = sin cambio, 1.15 = +15%, 0.90 = -10%
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Indicador visual */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ajuste:</span>
                  <span
                    className={`text-lg font-bold ${
                      watchPriceMultiplier > 1
                        ? 'text-red-600'
                        : watchPriceMultiplier < 1
                        ? 'text-green-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {calculatePercentage(watchPriceMultiplier)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Ejemplo:</span> {exampleCalculation()}
                </div>
              </div>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : rule ? 'Actualizar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
