// @ts-nocheck
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
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
import { Separator } from '@components/ui/separator';
import { Dog, Cat, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@components/ui/alert';

// Schema de validación con ZOD
const petFormSchema = z.object({
  // SECCIÓN 1: Información Básica
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  species: z.enum(['DOG', 'CAT'], { required_error: 'Debe seleccionar una especie' }),
  breed: z.string().optional(),
  birthDate: z.string().refine((date) => {
    const parsed = new Date(date);
    const today = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(today.getMonth() - 2);
    return parsed <= today && parsed >= twoMonthsAgo;
  }, 'La mascota debe tener al menos 2 meses y la fecha no puede ser futura'),
  gender: z.enum(['MALE', 'FEMALE', '']).optional(),
  color: z.string().optional(),
  weightKg: z.number().positive('El peso debe ser mayor a 0').optional().or(z.literal(undefined)),

  // SECCIÓN 2: Estado de Salud
  isSterilized: z.boolean().default(false),
  preExistingConditions: z.array(z.string()).default([]),
  disease: z.boolean().default(false),
  restricted: z.boolean().default(false),
  minorDisease: z.boolean().default(false),

  // SECCIÓN 3: Identificación (Opcional)
  microchipNumber: z.string().optional(),
  serial: z.string().optional(),

  // SECCIÓN 4: Cupón de descuento (Opcional)
  couponCode: z.string().optional(),

  // SECCIÓN 5: Términos y Condiciones
  tos: z.literal(true, {
    errorMap: () => ({ message: 'Debe aceptar los términos y condiciones' }),
  }),
});

type PetFormValues = z.infer<typeof petFormSchema>;

interface PetFormProps {
  initialData?: Partial<PetFormValues>;
  onSubmit: (data: PetFormValues) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const PetForm = ({ initialData, onSubmit, onCancel, isLoading = false }: PetFormProps) => {
  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: '',
      species: undefined,
      breed: '',
      birthDate: '',
      gender: '',
      color: '',
      weightKg: undefined,
      isSterilized: false,
      preExistingConditions: [],
      disease: false,
      restricted: false,
      minorDisease: false,
      microchipNumber: '',
      serial: '',
      couponCode: '',
      tos: undefined,
      ...initialData,
    },
  });

  const watchSpecies = form.watch('species');

  // Razas comunes por especie (para autocomplete básico)
  const dogBreeds = [
    'Labrador Retriever',
    'Golden Retriever',
    'Pastor Alemán',
    'Bulldog Francés',
    'Beagle',
    'Poodle',
    'Chihuahua',
    'Mestizo',
    'Otra',
  ];

  const catBreeds = [
    'Persa',
    'Siamés',
    'Maine Coon',
    'Británico de Pelo Corto',
    'Ragdoll',
    'Mestizo',
    'Otra',
  ];

  const breeds = watchSpecies === 'DOG' ? dogBreeds : watchSpecies === 'CAT' ? catBreeds : [];

  // Condiciones pre-existentes comunes
  const commonConditions = [
    'Diabetes',
    'Artritis',
    'Alergias',
    'Problemas cardíacos',
    'Problemas renales',
    'Epilepsia',
    'Displasia de cadera',
    'Obesidad',
  ];

  const handleConditionToggle = (condition: string) => {
    const current = form.getValues('preExistingConditions');
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    form.setValue('preExistingConditions', updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* SECCIÓN 1: Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales de tu mascota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la mascota *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Firulais" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Especie */}
            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especie *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="DOG" id="dog" />
                        <label htmlFor="dog" className="flex items-center gap-2 cursor-pointer">
                          <Dog className="h-5 w-5" />
                          <span>Perro</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CAT" id="cat" />
                        <label htmlFor="cat" className="flex items-center gap-2 cursor-pointer">
                          <Cat className="h-5 w-5" />
                          <span>Gato</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Raza */}
            {watchSpecies && (
              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raza</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una raza" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {breeds.map((breed) => (
                          <SelectItem key={breed} value={breed}>
                            {breed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Fecha de nacimiento */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de nacimiento *</FormLabel>
                  <FormControl>
                    <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
                  </FormControl>
                  <FormDescription>
                    La mascota debe tener al menos 2 meses de edad
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Género */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el género" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Macho</SelectItem>
                      <SelectItem value="FEMALE">Hembra</SelectItem>
                      <SelectItem value="">No especificado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Color */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Café, Negro, Blanco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Peso */}
              <FormField
                control={form.control}
                name="weightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso aproximado (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ej: 15.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 2: Estado de Salud */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Salud</CardTitle>
            <CardDescription>Información sobre la condición médica de tu mascota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Esterilizado */}
            <FormField
              control={form.control}
              name="isSterilized"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">¿Está esterilizado/a?</FormLabel>
                    <FormDescription>Indica si tu mascota ha sido esterilizada</FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Condiciones pre-existentes */}
            <FormField
              control={form.control}
              name="preExistingConditions"
              render={() => (
                <FormItem>
                  <FormLabel>Condiciones pre-existentes</FormLabel>
                  <FormDescription>
                    Selecciona todas las condiciones médicas que apliquen
                  </FormDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {commonConditions.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={form.watch('preExistingConditions').includes(condition)}
                          onCheckedChange={() => handleConditionToggle(condition)}
                        />
                        <label htmlFor={condition} className="text-sm cursor-pointer">
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Checkboxes de enfermedades con advertencia */}
            <div className="space-y-4">
              <Alert variant="default" className="border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Las siguientes condiciones pueden afectar la cobertura del seguro
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="disease"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-yellow-200 p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium">
                        ¿Tiene alguna enfermedad diagnosticada?
                      </FormLabel>
                      <FormDescription>
                        Enfermedades crónicas o condiciones médicas graves
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="restricted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-yellow-200 p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium">
                        ¿Tiene restricciones de cobertura?
                      </FormLabel>
                      <FormDescription>
                        Condiciones que limitan ciertos tratamientos
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minorDisease"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-yellow-200 p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium">¿Tiene enfermedad menor?</FormLabel>
                      <FormDescription>
                        Condiciones médicas leves o temporales
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 3: Identificación (Opcional) */}
        <Card>
          <CardHeader>
            <CardTitle>Identificación</CardTitle>
            <CardDescription>Información opcional de identificación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="microchipNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de microchip</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de microchip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de serie</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de serie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECCIÓN 4: Cupón de descuento (Opcional) */}
        <Card>
          <CardHeader>
            <CardTitle>Cupón de descuento</CardTitle>
            <CardDescription>Aplica un cupón si tienes uno disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="couponCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de cupón</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Ingresa tu código" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline">
                      Aplicar
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECCIÓN 5: Términos y Condiciones */}
        <Card>
          <CardHeader>
            <CardTitle>Términos y Condiciones</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="tos"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">
                      He leído y acepto los{' '}
                      <a href="/terminos" target="_blank" className="text-primary underline">
                        términos y condiciones
                      </a>{' '}
                      del seguro para mascotas *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : initialData ? 'Actualizar Mascota' : 'Crear Mascota'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
