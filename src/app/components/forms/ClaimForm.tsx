import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { Plus, Trash2, AlertCircle, FileUp } from 'lucide-react';
import { LoadingSpinner } from '@app/components/LoadingSpinner';

// Schema de validación con ZOD
const claimItemSchema = z.object({
  coverageTypeId: z.string().min(1, 'Selecciona un tipo de cobertura'),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  amountClp: z.number().positive('El monto debe ser mayor a 0'),
});

const claimFormSchema = z.object({
  // PASO 1: Seleccionar Mascota
  petId: z.string().min(1, 'Debes seleccionar una mascota'),

  // PASO 2: Datos del Veterinario
  vetName: z.string().min(2, 'El nombre del veterinario es requerido'),
  vetClinic: z.string().optional(),
  attentionDate: z.string().refine((date) => {
    const parsed = new Date(date);
    const today = new Date();
    return parsed <= today;
  }, 'La fecha de atención no puede ser futura'),

  // PASO 3: Información Médica
  diagnosis: z.string().min(10, 'El diagnóstico debe tener al menos 10 caracteres'),
  treatmentDescription: z.string().optional(),

  // PASO 4: Items de Bonificación
  items: z.array(claimItemSchema).min(1, 'Debes agregar al menos un item'),

  // PASO 5: Documentos (archivos manejados aparte)
  // requestForm y invoices se manejan en el estado local

  // PASO 6: Cuenta Bancaria
  bankAccountId: z.string().min(1, 'Debes seleccionar una cuenta bancaria'),

  // Comentarios Adicionales
  comment: z.string().optional(),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

interface PetWithSubscription {
  id: string;
  name: string;
  subscriptionId?: string;
  subscriptionStartDate?: string;
  subscriptionStatus?: string;
  planName?: string;
  coverageTypes?: Array<{
    id: string;
    name: string;
    benefitName: string;
  }>;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
}

interface ClaimFormProps {
  onSubmit: (data: ClaimFormValues, files: {
    requestForm: File;
    invoices: File[];
  }) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ClaimForm = ({ onSubmit, onCancel, isLoading = false }: ClaimFormProps) => {
  const [requestForm, setRequestForm] = useState<File | null>(null);
  const [invoices, setInvoices] = useState<File[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetWithSubscription | null>(null);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      petId: '',
      vetName: '',
      vetClinic: '',
      attentionDate: '',
      diagnosis: '',
      treatmentDescription: '',
      items: [{ coverageTypeId: '', description: '', amountClp: 0 }],
      bankAccountId: '',
      comment: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // TODO: Reemplazar con query real
  const { data: pets = [], isLoading: petsLoading } = useQuery<PetWithSubscription[]>({
    queryKey: ['pets-with-subscriptions'],
    queryFn: async () => {
      // Mock data
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 60));

      return [
        {
          id: '1',
          name: 'Firulais',
          subscriptionId: 'sub-1',
          subscriptionStartDate: sixtyDaysAgo.toISOString(),
          subscriptionStatus: 'ACTIVE',
          planName: 'Pet Ultra',
          coverageTypes: [
            { id: 'c1', name: 'Consulta Veterinaria', benefitName: 'Consultas' },
            { id: 'c2', name: 'Exámenes', benefitName: 'Diagnóstico' },
          ],
        },
        {
          id: '2',
          name: 'Michi',
          subscriptionId: 'sub-2',
          subscriptionStartDate: thirtyDaysAgo.toISOString(),
          subscriptionStatus: 'ACTIVE',
          planName: 'PetSmart',
          coverageTypes: [{ id: 'c1', name: 'Consulta Veterinaria', benefitName: 'Consultas' }],
        },
      ];
    },
  });

  // TODO: Reemplazar con query real
  const { data: bankAccounts = [] } = useQuery<BankAccount[]>({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      return [
        {
          id: '1',
          bankName: 'Banco de Chile',
          accountType: 'CHECKING',
          accountNumber: '12345678',
          accountHolder: 'Juan Pérez',
        },
        {
          id: '2',
          bankName: 'Scotiabank',
          accountType: 'SAVINGS',
          accountNumber: '87654321',
          accountHolder: 'Juan Pérez',
        },
      ];
    },
  });

  const handlePetChange = (petId: string) => {
    const pet = pets.find((p) => p.id === petId);
    setSelectedPet(pet || null);
  };

  const getSubscriptionDaysActive = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const canSubmitClaim = (pet: PetWithSubscription | null): {
    can: boolean;
    reason?: string;
  } => {
    if (!pet) {
      return { can: false, reason: 'Selecciona una mascota' };
    }
    if (!pet.subscriptionId || pet.subscriptionStatus !== 'ACTIVE') {
      return {
        can: false,
        reason: `${pet.name} no tiene una suscripción activa. Debes contratar un plan primero.`,
      };
    }
    if (!pet.subscriptionStartDate) {
      return { can: false, reason: 'No se puede determinar la fecha de inicio de la suscripción' };
    }

    const daysActive = getSubscriptionDaysActive(pet.subscriptionStartDate);
    if (daysActive < 30) {
      return {
        can: false,
        reason: `${pet.name} necesita tener al menos 1 mes de suscripción activa para solicitar reembolsos. Fecha de inicio: ${new Date(
          pet.subscriptionStartDate
        ).toLocaleDateString('es-CL')}, días transcurridos: ${daysActive}`,
      };
    }

    return { can: true };
  };

  const eligibility = canSubmitClaim(selectedPet);

  const handleFormSubmit = async (data: ClaimFormValues) => {
    if (!eligibility.can) {
      return;
    }
    if (!requestForm) {
      form.setError('root', { message: 'Debes subir el formulario de solicitud' });
      return;
    }
    if (invoices.length === 0) {
      form.setError('root', { message: 'Debes subir al menos una factura o boleta' });
      return;
    }

    await onSubmit(data, { requestForm, invoices });
  };

  const totalAmount = form.watch('items').reduce((sum, item) => sum + (item.amountClp || 0), 0);

  if (petsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* PASO 1: Seleccionar Mascota */}
        <Card>
          <CardHeader>
            <CardTitle>1. Selecciona tu Mascota</CardTitle>
            <CardDescription>
              Solo mascotas con suscripción activa de más de 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="petId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mascota *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePetChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una mascota" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pets.map((pet) => {
                        const days = pet.subscriptionStartDate
                          ? getSubscriptionDaysActive(pet.subscriptionStartDate)
                          : 0;
                        const isEligible = pet.subscriptionStatus === 'ACTIVE' && days >= 30;

                        return (
                          <SelectItem key={pet.id} value={pet.id} disabled={!isEligible}>
                            {pet.name} - {pet.planName || 'Sin plan'} 
                            {pet.subscriptionStatus === 'ACTIVE' ? ` (${days} días)` : ' (Inactivo)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPet && !eligibility.can && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No puede solicitar reembolso</AlertTitle>
                <AlertDescription>{eligibility.reason}</AlertDescription>
              </Alert>
            )}

            {selectedPet && eligibility.can && (
              <Alert className="mt-4 border-green-500 bg-green-50">
                <AlertDescription className="text-green-800">
                  ✓ {selectedPet.name} es elegible para solicitar reembolsos. Plan:{' '}
                  {selectedPet.planName}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* PASO 2: Datos del Veterinario */}
        <Card>
          <CardHeader>
            <CardTitle>2. Datos del Veterinario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="vetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del veterinario *</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vetClinic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clínica veterinaria</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la clínica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attentionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de atención *</FormLabel>
                  <FormControl>
                    <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
                  </FormControl>
                  <FormDescription>La fecha no puede ser futura</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* PASO 3: Información Médica */}
        <Card>
          <CardHeader>
            <CardTitle>3. Información Médica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el diagnóstico médico..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Mínimo 10 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatmentDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del tratamiento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el tratamiento realizado..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* PASO 4: Items de Bonificación */}
        <Card>
          <CardHeader>
            <CardTitle>4. Items de Bonificación</CardTitle>
            <CardDescription>Agrega los servicios que deseas reembolsar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Item #{index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name={`items.${index}.coverageTypeId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de cobertura *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedPet?.coverageTypes?.map((coverage) => (
                            <SelectItem key={coverage.id} value={coverage.id}>
                              {coverage.name} - {coverage.benefitName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Consulta de emergencia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.amountClp`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto (CLP) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ coverageTypeId: '', description: '', amountClp: 0 })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar otro item
            </Button>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${totalAmount.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PASO 5: Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>5. Documentos</CardTitle>
            <CardDescription>Sube el formulario y las facturas/boletas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Formulario de solicitud */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Formulario de solicitud (PDF) *
              </label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <FileUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setRequestForm(e.target.files?.[0] || null)}
                  className="max-w-xs mx-auto"
                />
                {requestForm && (
                  <p className="text-sm text-green-600 mt-2">✓ {requestForm.name}</p>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Solo PDF, máximo 10MB</p>
            </div>

            {/* Facturas/Boletas */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Facturas o Boletas (Imágenes/PDF) *
              </label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <FileUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => setInvoices(Array.from(e.target.files || []))}
                  className="max-w-xs mx-auto"
                />
                {invoices.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {invoices.map((file, idx) => (
                      <p key={idx} className="text-sm text-green-600">
                        ✓ {file.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                PDF o imágenes (JPG, PNG), máximo 5MB cada una, máximo 5 archivos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PASO 6: Cuenta Bancaria */}
        <Card>
          <CardHeader>
            <CardTitle>6. Cuenta Bancaria</CardTitle>
            <CardDescription>Selecciona dónde recibirás el reembolso</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuenta bancaria *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cuenta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bankName} - {account.accountType} - ****
                          {account.accountNumber.slice(-4)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm text-gray-500 mt-2">
              ¿No tienes cuenta?{' '}
              <a href="/cuentas-bancarias/nueva" className="text-primary underline">
                Agregar nueva cuenta
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Comentarios Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle>Comentarios Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional que quieras compartir..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Errores generales */}
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading || !eligibility.can}>
            {isLoading ? 'Enviando...' : 'Enviar Solicitud de Reembolso'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
