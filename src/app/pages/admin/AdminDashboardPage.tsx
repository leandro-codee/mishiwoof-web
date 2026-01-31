/**
 * AdminDashboardPage - Panel principal de administración
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Ticket, ClipboardList, Building2, TrendingUp } from 'lucide-react';

const links = [
  { to: '/admin/planes', label: 'Planes', icon: FileText },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/cupones', label: 'Cupones', icon: Ticket },
  { to: '/admin/reclamos', label: 'Reclamos', icon: ClipboardList },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { to: '/admin/indicadores', label: 'Indicadores (UF)', icon: TrendingUp },
];

export function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de administración</h1>
      <p className="text-gray-600 mb-8">Gestiona planes, usuarios, cupones, reclamos, empresas e indicadores.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="hover:border-[#FF6F61] hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Icon className="h-6 w-6 text-[#FF6F61]" />
                <CardTitle className="text-lg">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Ir a gestión</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
