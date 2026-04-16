/**
 * AdminLayout - Sidebar + contenido para páginas de administración
 *
 * Usa shadcn Sidebar (https://ui.shadcn.com/docs/components/radix/sidebar):
 * - Desktop: sidebar colapsable con toggle en el navbar
 * - Mobile: offcanvas (Sheet) disparado desde el mismo botón
 */

import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import { cn } from '@shared/utils/cn';
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
  Image as ImageIcon,
  LogOut,
  ExternalLink,
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
  { to: '/admin/archivos', end: false, label: 'Archivos', icon: ImageIcon },
];

function isItemActive(pathname: string, to: string, end: boolean) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function AdminSidebar() {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          to="/admin"
          onClick={closeOnMobile}
          className="flex items-center gap-2 px-2 py-1.5"
        >
          <img
            src="/assets/logo woof.svg"
            alt="MishiWoof"
            className="h-8 w-8 shrink-0"
          />
          <span className="font-bold text-gray-800 group-data-[collapsible=icon]:hidden">
            Admin
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, end, label, icon: Icon }) => {
                const active = isItemActive(pathname, to, end);
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                      className={cn(
                        'data-[active=true]:bg-[#FF6F61] data-[active=true]:text-white data-[active=true]:hover:bg-[#FF6F61]/90 data-[active=true]:hover:text-white',
                      )}
                    >
                      <NavLink to={to} end={end} onClick={closeOnMobile}>
                        <Icon />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Ir al sitio">
              <Link to="/inicio" onClick={closeOnMobile}>
                <ExternalLink />
                <span>Ir al sitio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              onClick={() => {
                closeOnMobile();
                logout();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function AdminTopbar() {
  const { pathname } = useLocation();
  const current = navItems.find((item) => isItemActive(pathname, item.to, item.end));
  const title = current?.label ?? 'Admin';

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 bg-white/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-white/70 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-5" />
      <h1 className="truncate text-sm font-semibold text-gray-800 sm:text-base">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link to="/inicio">Ir al sitio</Link>
        </Button>
      </div>
    </header>
  );
}

export function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-gray-50">
        <AdminTopbar />
        <div className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
