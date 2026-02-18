/**
 * LayoutSucursal - Nav + contenido para páginas de Mi cuenta (reclamos, chat, notificaciones)
 */

import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import { useUnreadCount } from '@modules/notifications/presentation/hooks/useNotifications';

interface LayoutSucursalProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function LayoutSucursal({ title, subtitle, children }: LayoutSucursalProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = (unreadData as { count?: number } | undefined)?.count ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <section className="bg-[#FFDCE6] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-12 shadow-lg">
            <nav className="mb-8 md:mb-12">
              <div className="flex items-center justify-between">
                <Link to="/inicio" className="flex items-center">
                  <img src="/assets/logo woof.svg" alt="Mishiwoof Logo" className="h-12 md:h-14" />
                </Link>
                <div className="flex items-center gap-4 md:gap-6">
                  <Link
                    to="/inicio"
                    className={`text-sm md:text-base transition-all rounded-full px-4 md:px-6 py-2 border-2 ${
                      location.pathname === '/home' ? 'text-[#FF6F61] font-semibold border-transparent' : 'text-black border-transparent hover:border-violet-500'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/sucursal-virtual"
                    className={`text-sm md:text-base transition-all rounded-full px-4 md:px-6 py-2 border-2 ${
                      location.pathname === '/sucursal-virtual' ? 'text-[#FF6F61] font-semibold border-transparent' : 'text-black border-transparent hover:border-violet-500'
                    }`}
                  >
                    Mi cuenta
                  </Link>
                  <Link
                    to="/sucursal-virtual/notificaciones"
                    className="relative text-sm md:text-base rounded-full px-4 md:px-6 py-2 border-2 border-transparent hover:border-violet-500 flex items-center gap-1"
                  >
                    Notificaciones
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF6F61] text-white text-xs font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/planes-y-coberturas"
                    className={`text-sm md:text-base transition-all rounded-full px-4 md:px-6 py-2 border-2 ${
                      location.pathname === '/planes-y-coberturas' ? 'text-[#FF6F61] font-semibold border-transparent' : 'text-black border-transparent hover:border-violet-500'
                    }`}
                  >
                    Ver planes
                  </Link>
                  <Button className="bg-[#FF6F61] text-white hover:bg-[#FF6F61]/90 rounded-lg px-4" onClick={() => logout()}>
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </nav>

            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-black">{title}</h1>
              {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </section>

      <footer className="bg-[#E0E8FF] px-4 md:px-8 py-6 mt-auto">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Link to="/inicio" className="flex items-center">
            <img src="/assets/logo woof.svg" alt="Mishiwoof" className="h-8 opacity-70" style={{ filter: 'grayscale(100%)' }} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
