/**
 * AdminLayout - Sidebar + contenido para páginas de administración
 */

import { Link, NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  Users,
  Ticket,
  ClipboardList,
  Building2,
  TrendingUp,
  FileCheck,
  Receipt,
  CreditCard,
  Gift,
  Stethoscope,
  Landmark,
  Calculator,
} from 'lucide-react';

const navItems = [
  { to: '/admin', end: true, label: 'Panel', icon: LayoutDashboard },
  { to: '/admin/planes', end: false, label: 'Planes', icon: FileText },
  { to: '/admin/usuarios', end: false, label: 'Usuarios', icon: Users },
  { to: '/admin/cupones', end: false, label: 'Cupones', icon: Ticket },
  { to: '/admin/reclamos', end: false, label: 'Reclamos', icon: ClipboardList },
  { to: '/admin/empresas', end: false, label: 'Empresas', icon: Building2 },
  { to: '/admin/contratos', end: false, label: 'Contratos', icon: FileCheck },
  { to: '/admin/facturas-empresariales', end: false, label: 'Facturas', icon: Receipt },
  { to: '/admin/pagos', end: false, label: 'Pagos', icon: CreditCard },
  { to: '/admin/beneficios', end: false, label: 'Beneficios', icon: Gift },
  { to: '/admin/veterinarias', end: false, label: 'Veterinarias', icon: Stethoscope },
  { to: '/admin/cuentas-bancarias', end: false, label: 'Cuentas Bancarias', icon: Landmark },
  { to: '/admin/reglas-precio', end: false, label: 'Reglas de Precio', icon: Calculator },
  { to: '/admin/indicadores', end: false, label: 'Indicadores (UF)', icon: TrendingUp },
];

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/assets/logo woof.svg" alt="MishiWoof" className="h-10" />
            <span className="font-bold text-gray-800">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#FF6F61] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-200">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/inicio">Ir al sitio</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700" onClick={() => logout()}>
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
