/**
 * LoginPage - Inicio de sesión
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginMutation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const locationState = location.state as { from?: string; planId?: string } | null;
  const from = locationState?.from;
  const planId = locationState?.planId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success('Sesión iniciada correctamente');
      if (from === '/contratacion' && planId) {
        navigate('/contratacion', { state: { planId }, replace: true });
      } else if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/sucursal-virtual', { replace: true });
      }
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
          <h1 className="text-2xl font-bold text-black mb-2">Iniciar sesión</h1>
          <p className="text-gray-600 text-sm mb-6">Ingresa tu email y contraseña</p>

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
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[#FF6F61] font-medium hover:underline">
              Regístrate
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
