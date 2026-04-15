/**
 * SucursalVirtualPage Component
 *
 * Virtual branch - perfil, mascotas, suscripciones
 */

import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import { useMe } from '@modules/users/presentation/hooks/useUsers';
import { usePetsList } from '@modules/pets/presentation/hooks/usePets';
import { useSubscriptions } from '@modules/billing/presentation/hooks/useBilling';
import { useUnreadCount } from '@modules/notifications/presentation/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentMethodsSection } from '@app/components/PaymentMethodsSection';
import { PetCard } from '@app/components/PetCard';
import { cn } from '@shared/utils/cn';

function subscriptionStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return { label: 'Activo', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'PAST_DUE':
      return { label: 'Pago pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'CANCELLED':
      return { label: 'Cancelado', className: 'bg-red-50 text-red-500 border-red-200' };
    default:
      return { label: status, className: 'bg-gray-100 text-gray-500 border-gray-200' };
  }
}

export function SucursalVirtualPage() {
  const location = useLocation();
  const isSucursal = location.pathname === '/sucursal-virtual';
  const { logout, user: authUser } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useMe();
  const { data: pets = [], isLoading: loadingPets } = usePetsList();
  const { data: subscriptions = [], isLoading: loadingSubs } = useSubscriptions();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = (unreadData as { count?: number } | undefined)?.count ?? 0;
  const displayName = profile?.firstName ?? profile?.lastName ?? authUser?.email ?? 'Usuario';

  const activeSub = subscriptions.find(
    (s) => String(s.status).toUpperCase() === 'ACTIVE',
  ) ?? subscriptions[0] ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <section className="bg-[#FFDCE6] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-12 shadow-lg">

            {/* Navbar */}
            <nav className="mb-8 md:mb-12">
              <div className="flex items-center justify-between">
                <Link to="/inicio" className="flex items-center">
                  <img src="/assets/logo woof.svg" alt="Mishiwoof Logo" className="h-12 md:h-14" />
                </Link>
                <div className="flex items-center gap-4 md:gap-6">
                  <Link
                    to="/inicio"
                    className={`text-sm md:text-base transition-all rounded-full px-4 md:px-6 py-2 border-2 ${
                      location.pathname === '/home'
                        ? 'text-[#FF6F61] font-semibold border-transparent'
                        : 'text-black border-transparent hover:border-violet-500'
                    }`}
                  >
                    Home
                  </Link>
                  <Button
                    asChild
                    className={`${
                      isSucursal
                        ? 'bg-[#FF6F61] text-white border-transparent'
                        : 'bg-transparent text-black border-transparent hover:border-2 hover:border-violet-500'
                    } rounded-full px-4 md:px-6 border-2 transition-all`}
                  >
                    <Link to="/sucursal-virtual">Mi cuenta</Link>
                  </Button>
                  <Link
                    to="/sucursal-virtual/notificaciones"
                    className="relative text-sm md:text-base rounded-full px-4 md:px-6 py-2 border-2 border-transparent hover:border-violet-500"
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
                      location.pathname === '/planes-y-coberturas'
                        ? 'text-[#FF6F61] font-semibold border-transparent'
                        : 'text-black border-transparent hover:border-violet-500'
                    }`}
                  >
                    Ver planes
                  </Link>
                </div>
              </div>
            </nav>

            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-2">
                Bienvenido{authUser?.email?.endsWith('a') ? 'a' : ''} a la{' '}
                <span className="text-[#FF6F61]">sucursal virtual</span>
              </h1>
              {loadingProfile ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <p className="text-gray-600">
                  {displayName} · {profile?.email ?? authUser?.email}
                </p>
              )}
            </div>

            {/* ── Mascotas ───────────────────────────────────────────── */}
            <div className="bg-gray-100 rounded-xl p-6 md:p-8 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black">Mis mascotas</h2>
                {!loadingPets && pets.length > 0 && (
                  <span className="text-xs text-gray-400 font-medium">
                    {pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'}
                  </span>
                )}
              </div>

              {loadingPets ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[168px] w-full rounded-2xl" />
                  ))}
                </div>
              ) : pets.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  Aún no tienes mascotas.{' '}
                  <Link to="/contratacion" className="text-[#FF6F61] underline font-medium">
                    Contratar plan
                  </Link>
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {pets.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      planName={activeSub?.planName ?? activeSub?.planId ?? null}
                      planStatus={activeSub?.status ?? null}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Payment methods */}
            <PaymentMethodsSection />

            {/* ── Suscripciones ──────────────────────────────────────── */}
            {subscriptions.length > 0 && (
              <div className="bg-gray-100 rounded-xl p-6 md:p-8 mb-8">
                <h2 className="text-lg font-semibold text-black mb-4">Mis suscripciones</h2>
                {loadingSubs ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {subscriptions.map((s) => {
                      const { label, className } = subscriptionStatusBadge(s.status);
                      const isPastDue = String(s.status).toUpperCase() === 'PAST_DUE';
                      return (
                        <li
                          key={s.id}
                          className="bg-white rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Status dot */}
                            <span
                              className={cn(
                                'w-2 h-2 rounded-full shrink-0',
                                isPastDue ? 'bg-amber-400' : 'bg-emerald-400',
                                String(s.status).toUpperCase() === 'CANCELLED' && 'bg-red-400',
                              )}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {s.planName ?? s.planId}
                              </p>
                              <p className="text-xs text-gray-400">{s.finalPriceUf} UF/mes</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Status badge */}
                            <span
                              className={cn(
                                'text-xs font-medium px-2.5 py-0.5 rounded-full border',
                                className,
                              )}
                            >
                              {label}
                            </span>

                            {/* CTA solo en PAST_DUE */}
                            {isPastDue && (
                              <Link
                                to={`/pagos?suscripcion=${s.id}`}
                                className="text-xs font-semibold text-white bg-[#FF6F61] hover:bg-[#FF6F61]/90 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Regularizar
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Action Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <Link
                to="/reclamos"
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#FF6F61] transition-colors"
              >
                <span className="text-sm md:text-base text-black font-medium">Realizar una bonificación</span>
                <svg className="w-5 h-5 text-[#FF6F61]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/reclamos"
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#FF6F61] transition-colors"
              >
                <span className="text-sm md:text-base text-black font-medium">Ver estado de mi bonificación</span>
                <svg className="w-5 h-5 text-[#FF6F61]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/chat"
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#FF6F61] transition-colors"
              >
                <span className="text-sm md:text-base text-black font-medium">¿Tienes dudas? Escríbenos</span>
                <svg className="w-5 h-5 text-[#FF6F61]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                </svg>
              </Link>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <Link
                to="/chat"
                className="text-sm md:text-base text-black hover:text-[#FF6F61] transition-colors flex items-center gap-2"
              >
                ¿Tienes dudas? Escríbenos
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </Link>
              <Button
                className="bg-[#FF6F61] text-white hover:bg-[#FF6F61]/90 rounded-lg px-6 md:px-8"
                onClick={() => logout()}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <section className="bg-[#E0E8FF] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link to="/planes-y-coberturas" className="text-black hover:text-[#FF6F61] transition-colors text-sm md:text-base">
                Ver planes
              </Link>
              <Link to="/contratacion" className="text-black hover:text-[#FF6F61] transition-colors text-sm md:text-base">
                Ir a contratar
              </Link>
              <Link to="/sucursal-virtual" className="text-black hover:text-[#FF6F61] transition-colors text-sm md:text-base flex items-center gap-2">
                Recibe asesoría
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E0E8FF] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Link to="/inicio" className="flex items-center">
            <img
              src="/assets/logo woof.svg"
              alt="Mishiwoof Logo"
              className="h-8 md:h-12"
              style={{ filter: 'grayscale(100%)' }}
            />
          </Link>
        </div>
      </footer>
    </div>
  );
}