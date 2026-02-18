import { useState } from 'react';
// @ts-nocheck
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
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

// Helper para validar RUT chileno
const validateRUT = (rut: string): boolean => {
  // Eliminar puntos y guiones
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  
  if (rut.length < 8) return false;
  
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return dv === calculatedDV;
};

// Schema de validación con ZOD - TODOS los campos
const registerFormSchema = z.object({
  // 1. Email* (required)
  email: z.string().email('Email inválido'),

  // 2. Contraseña* (required, min 8, con indicador de fortaleza)
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),

  // 3. Confirmar Contraseña* (required, debe coincidir)
  confirmPassword: z.string(),

  // 4. Nombre* (required)
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),

  // 5. Apellido* (required)
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),

  // 6. RUT (opcional, con validación chilena)
  dni: z
    .string()
    .optional()
    .refine((val) => !val || validateRUT(val), 'RUT inválido'),

  // 7. Teléfono (opcional, formato +56 9 XXXX XXXX)
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+56\s?9\s?\d{4}\s?\d{4}$/.test(val),
      'Formato: +56 9 XXXX XXXX'
    ),

  // 8. Fecha de Nacimiento (opcional)
  birthDate: z.string().optional(),

  // 9. Dirección (opcional)
  address: z.string().optional(),

  // 10. Región (opcional, select de regions API)
  regionId: z.string().optional(),

  // 11. Comuna (opcional, select dependiente de región, states API)
  stateId: z.string().optional(),

  // 12. Género (opcional: Masculino/Femenino/Otro)
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', '']).optional(),

  // 13. Código de Referido (opcional)
  referredCode: z.string().optional(),

  // 14. Acepto términos y condiciones* (required checkbox)
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

interface Region {
  id: string;
  name: string;
}

interface State {
  id: string;
  name: string;
  regionId: string;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => void | Promise<void>;
  isLoading?: boolean;
}

export const RegisterForm = ({ onSubmit, isLoading = false }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      birthDate: '',
      address: '',
      regionId: '',
      stateId: '',
      gender: '',
      referredCode: '',
      acceptTerms: undefined,
    },
  });

  const watchPassword = form.watch('password');
  const watchRegionId = form.watch('regionId');

  // TODO: Reemplazar con query real
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

  // TODO: Reemplazar con query real
  const { data: states = [] } = useQuery<State[]>({
    queryKey: ['states', watchRegionId],
    queryFn: async () => {
      if (!watchRegionId) return [];
      // Mock data basado en región
      const statesByRegion: Record<string, State[]> = {
        '1': [
          { id: 's1', name: 'Santiago', regionId: '1' },
          { id: 's2', name: 'Providencia', regionId: '1' },
          { id: 's3', name: 'Las Condes', regionId: '1' },
        ],
        '2': [
          { id: 's4', name: 'Valparaíso', regionId: '2' },
          { id: 's5', name: 'Viña del Mar', regionId: '2' },
        ],
        '3': [
          { id: 's6', name: 'Concepción', regionId: '3' },
          { id: 's7', name: 'Talcahuano', regionId: '3' },
        ],
      };
      return statesByRegion[watchRegionId] || [];
    },
    enabled: !!watchRegionId,
  });

  // Indicador de fortaleza de contraseña
  const getPasswordStrength = (password: string): {
    score: number;
    label: string;
    color: string;
  } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Débil', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Media', color: 'bg-yellow-500' };
    return { score, label: 'Fuerte', color: 'bg-green-500' };
  };

  const passwordStrength = watchPassword ? getPasswordStrength(watchPassword) : null;

  // Formatear RUT mientras se escribe
  const formatRUT = (value: string): string => {
    // Eliminar caracteres no permitidos
    value = value.replace(/[^0-9kK]/g, '');
    
    if (value.length <= 1) return value;
    
    // Separar cuerpo y dígito verificador
    const dv = value.slice(-1);
    let body = value.slice(0, -1);
    
    // Agregar puntos al cuerpo
    body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${body}-${dv}`;
  };

  const handleRUTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRUT(e.target.value);
    form.setValue('dni', formatted);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Completa el formulario para registrarte en MishiWoof
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* SECCIÓN: Credenciales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Credenciales de Acceso</h3>
                
                {/* 1. Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2. Contraseña */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordStrength && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded ${
                                  i < passwordStrength.score
                                    ? passwordStrength.color
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600">
                            Fortaleza: {passwordStrength.label}
                          </p>
                        </div>
                      )}
                      <FormDescription>
                        Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. Confirmar Contraseña */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* SECCIÓN: Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Personal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 4. Nombre */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 5. Apellido */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido *</FormLabel>
                        <FormControl>
                          <Input placeholder="Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 6. RUT */}
                  <FormField
                    control={form.control}
                    name="dni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RUT</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12.345.678-9"
                            {...field}
                            onChange={handleRUTChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 7. Teléfono */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+56 9 1234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 8. Fecha de Nacimiento */}
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 9. Dirección */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Calle Principal #123, Depto 456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 10. Región */}
                  <FormField
                    control={form.control}
                    name="regionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Región</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('stateId', ''); // Reset comuna
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona región" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                {region.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 11. Comuna */}
                  <FormField
                    control={form.control}
                    name="stateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comuna</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!watchRegionId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona comuna" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 12. Género */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu género" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Masculino</SelectItem>
                          <SelectItem value="FEMALE">Femenino</SelectItem>
                          <SelectItem value="OTHER">Otro</SelectItem>
                          <SelectItem value="">Prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 13. Código de Referido */}
                <FormField
                  control={form.control}
                  name="referredCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Referido</FormLabel>
                      <FormControl>
                        <Input placeholder="Código de referido (opcional)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Si tienes un código de referido, ingrésalo aquí
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* 14. Términos y Condiciones */}
              <FormField
                control={form.control}
                name="acceptTerms"
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
                        Acepto los{' '}
                        <Link to="/terminos" target="_blank" className="text-primary underline">
                          términos y condiciones
                        </Link>{' '}
                        y la{' '}
                        <Link to="/privacidad" target="_blank" className="text-primary underline">
                          política de privacidad
                        </Link>{' '}
                        *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Botones */}
              <div className="space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/iniciar-sesion" className="text-primary font-medium underline">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
