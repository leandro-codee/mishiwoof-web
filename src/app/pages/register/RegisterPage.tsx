/**
 * RegisterPage - Registro de usuario
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, registerMutation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        email,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });
      toast.success('Cuenta creada correctamente');
      navigate('/sucursal-virtual', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFDCE6]">
      <div className="max-w-md mx-auto w-full px-4 py-12 flex flex-col justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <Link to="/home" className="inline-block mb-8">
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña (mín. 8 caracteres)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                minLength={8}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellido"
                  className="mt-1"
                />
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
            <Link to="/login" className="text-[#FF6F61] font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/home" className="text-gray-500 hover:text-black">
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
