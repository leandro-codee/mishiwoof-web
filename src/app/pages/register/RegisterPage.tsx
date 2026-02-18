/**
 * RegisterPage - Registro de usuario
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { getRegions, getStatesByRegion } from '@shared/infrastructure/api/regions.api';
import type { Region, State } from '@shared/infrastructure/api/regions.api';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, registerMutation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [regionId, setRegionId] = useState('');
  const [stateId, setStateId] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await getRegions();
        setRegions(data);
      } catch (error) {
        console.error('Error loading regions:', error);
        toast.error('Error al cargar las regiones');
      }
    };
    loadRegions();
  }, []);

  // Load states when region changes
  useEffect(() => {
    const loadStates = async () => {
      if (!regionId) {
        setStates([]);
        setStateId('');
        return;
      }
      try {
        const data = await getStatesByRegion(regionId);
        setStates(data);
      } catch (error) {
        console.error('Error loading states:', error);
        toast.error('Error al cargar las comunas');
      }
    };
    loadStates();
  }, [regionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        dni: dni || undefined,
        phone: phone || undefined,
        birthDate: birthDate || undefined,
        gender: gender || undefined,
        stateId: stateId || undefined,
      });
      toast.success('Cuenta creada correctamente');
      navigate('/mi-cuenta', { replace: true });
    } catch (err) {
      const details = getValidationDetails(err);
      if (details) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(details)) flat[k] = (v as string[])[0] ?? '';
        setFieldErrors(flat);
        toast.error('Revisa los campos marcados.');
      } else {
        setFieldErrors({});
        toast.error(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFDCE6]">
      <div className="max-w-md mx-auto w-full px-4 py-12 flex flex-col justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <Link to="/inicio" className="inline-block mb-8">
            <img src="/assets/logo woof.svg" alt="MishiWoof" className="h-10" />
          </Link>
          <h1 className="text-2xl font-bold text-black mb-2">Crear cuenta</h1>
          <p className="text-gray-600 text-sm mb-6">Completa tus datos para registrarte</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                placeholder="tu@email.com"
                className={`mt-1 ${fieldErrors.email ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.email && <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password">Contraseña (mín. 8 caracteres)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
                placeholder="••••••••"
                className={`mt-1 ${fieldErrors.password ? 'border-red-500' : ''}`}
                minLength={8}
                required
              />
              {fieldErrors.password && <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: '' })); }}
                  placeholder="Nombre"
                  className={`mt-1 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                />
                {fieldErrors.firstName && <p className="text-sm text-red-600 mt-1">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: '' })); }}
                  placeholder="Apellido"
                  className={`mt-1 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                />
                {fieldErrors.lastName && <p className="text-sm text-red-600 mt-1">{fieldErrors.lastName}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="dni">RUT</Label>
              <Input
                id="dni"
                type="text"
                value={dni}
                onChange={(e) => { setDni(e.target.value); setFieldErrors((p) => ({ ...p, dni: '' })); }}
                placeholder="12.345.678-9"
                className={`mt-1 ${fieldErrors.dni ? 'border-red-500' : ''}`}
              />
              {fieldErrors.dni && <p className="text-sm text-red-600 mt-1">{fieldErrors.dni}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setFieldErrors((p) => ({ ...p, phone: '' })); }}
                placeholder="+56 9 1234 5678"
                className={`mt-1 ${fieldErrors.phone ? 'border-red-500' : ''}`}
              />
              {fieldErrors.phone && <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => { setBirthDate(e.target.value); setFieldErrors((p) => ({ ...p, birthDate: '' })); }}
                  className={`mt-1 ${fieldErrors.birthDate ? 'border-red-500' : ''}`}
                />
                {fieldErrors.birthDate && <p className="text-sm text-red-600 mt-1">{fieldErrors.birthDate}</p>}
              </div>
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select value={gender} onValueChange={(v) => { setGender(v); setFieldErrors((p) => ({ ...p, gender: '' })); }}>
                  <SelectTrigger className={`mt-1 ${fieldErrors.gender ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Femenino</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.gender && <p className="text-sm text-red-600 mt-1">{fieldErrors.gender}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full">
                <Label htmlFor="region">Región</Label>
                <Select value={regionId} onValueChange={(v) => { setRegionId(v); setFieldErrors((p) => ({ ...p, regionId: '' })); }}>
                  <SelectTrigger className={`mt-1 ${fieldErrors.regionId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecciona región" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id} className="truncate">
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.regionId && <p className="text-sm text-red-600 mt-1">{fieldErrors.regionId}</p>}
              </div>
              <div className="w-full">
                <Label htmlFor="state">Comuna</Label>
                <Select value={stateId} onValueChange={(v) => { setStateId(v); setFieldErrors((p) => ({ ...p, stateId: '' })); }} disabled={!regionId}>
                  <SelectTrigger className={`mt-1 ${fieldErrors.stateId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecciona comuna" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id} className="truncate">
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.stateId && <p className="text-sm text-red-600 mt-1">{fieldErrors.stateId}</p>}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Registrando...' : 'Registrarme'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/iniciar-sesion" className="text-[#FF6F61] font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/inicio" className="text-gray-500 hover:text-black">
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
