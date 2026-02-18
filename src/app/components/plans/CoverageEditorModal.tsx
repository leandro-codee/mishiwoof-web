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
import { Textarea } from '@components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';

const coverageSchema = z.object({
  coverageTypeId: z.string().min(1, 'Selecciona un tipo de cobertura'),
  benefitId: z.string().min(1, 'Selecciona un beneficio'),
  coveragePercentage: z.number().min(0).max(100, 'Debe estar entre 0 y 100'),
  maxAmountPerEventUF: z.number().positive().optional(),
  maxAnnualEvents: z.number().int().positive().optional(),
  disclaimer: z.string().optional(),
});

type CoverageValues = z.infer<typeof coverageSchema>;

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

interface CoverageType {
  id: string;
  name: string;
  benefitId: string;
  description?: string;
}

interface Benefit {
  id: string;
  name: string;
  icon?: string;
}

interface CoverageEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  coverage?: Coverage | null;
  onSave: (data: any) => void | Promise<void>;
  isLoading?: boolean;
}

export const CoverageEditorModal = ({
  open,
  onOpenChange,
  coverage,
  onSave,
  isLoading = false,
}: CoverageEditorModalProps) => {
  const form = useForm<CoverageValues>({
    resolver: zodResolver(coverageSchema),
    defaultValues: {
      coverageTypeId: coverage?.coverageTypeId || '',
      benefitId: coverage?.benefitId || '',
      coveragePercentage: coverage?.coveragePercentage || 100,
      maxAmountPerEventUF: coverage?.maxAmountPerEventUF,
      maxAnnualEvents: coverage?.maxAnnualEvents,
      disclaimer: coverage?.disclaimer || '',
    },
  });

  // TODO: Fetch benefits from API
  const { data: benefits = [] } = useQuery<Benefit[]>({
    queryKey: ['benefits'],
    queryFn: async () => {
      return [
        { id: '1', name: 'Consultas Veterinarias', icon: 'stethoscope' },
        { id: '2', name: 'Exámenes y Diagnóstico', icon: 'microscope' },
        { id: '3', name: 'Medicamentos', icon: 'pill' },
        { id: '4', name: 'Vacunas y Prevención', icon: 'syringe' },
        { id: '5', name: 'Hospitalización', icon: 'bed' },
        { id: '6', name: 'Procedimientos', icon: 'scissors' },
        { id: '7', name: 'Dental', icon: 'tooth' },
      ];
    },
  });

  const selectedBenefitId = form.watch('benefitId');

  // TODO: Fetch coverage types filtered by benefit
  const { data: coverageTypes = [] } = useQuery<CoverageType[]>({
    queryKey: ['coverage-types', selectedBenefitId],
    queryFn: async () => {
      if (!selectedBenefitId) return [];
      // Mock data
      return [
        { id: 'c1', name: 'Consulta Veterinaria', benefitId: '1' },
        { id: 'c2', name: 'Consulta de Especialidad', benefitId: '1' },
        { id: 'c3', name: 'Telemedicina', benefitId: '1' },
        { id: 'c4', name: 'Exámenes de Laboratorio', benefitId: '2' },
        { id: 'c5', name: 'Imagenología', benefitId: '2' },
      ].filter((ct) => ct.benefitId === selectedBenefitId);
    },
    enabled: !!selectedBenefitId,
  });

  const handleSubmit = async (data: CoverageValues) => {
    const selectedCoverageType = coverageTypes.find((ct) => ct.id === data.coverageTypeId);
    const selectedBenefit = benefits.find((b) => b.id === data.benefitId);

    await onSave({
      ...data,
      id: coverage?.id,
      coverageTypeName: selectedCoverageType?.name || '',
      benefitName: selectedBenefit?.name || '',
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {coverage ? 'Editar Cobertura' : 'Agregar Cobertura'}
          </DialogTitle>
          <DialogDescription>
            Define qué servicios cubre este plan y en qué porcentaje
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Beneficio */}
            <FormField
              control={form.control}
              name="benefitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficio *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('coverageTypeId', ''); // Reset coverage type
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un beneficio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {benefits.map((benefit) => (
                        <SelectItem key={benefit.id} value={benefit.id}>
                          {benefit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Cobertura */}
            <FormField
              control={form.control}
              name="coverageTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cobertura *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coverageTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedBenefitId
                      ? 'Selecciona el tipo específico de servicio'
                      : 'Primero selecciona un beneficio'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Porcentaje de Cobertura */}
            <FormField
              control={form.control}
              name="coveragePercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Porcentaje de Cobertura (%) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Porcentaje que cubre el plan (0-100)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Monto Máximo por Evento */}
              <FormField
                control={form.control}
                name="maxAmountPerEventUF"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Máx/Evento (UF)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="1.5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Eventos Máximos al Año */}
              <FormField
                control={form.control}
                name="maxAnnualEvents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eventos Máx/Año</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Disclaimer */}
            <FormField
              control={form.control}
              name="disclaimer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disclaimer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Aclaraciones o restricciones específicas..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Información adicional sobre esta cobertura (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : coverage ? 'Actualizar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
