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
import { Skeleton } from '@/components/ui/skeleton';

export function SucursalVirtualPage() {
  const location = useLocation();
  const isSucursal = location.pathname === '/sucursal-virtual';
  const { logout, user: authUser } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useMe();
  const { data: pets = [], isLoading: loadingPets } = usePetsList();
  const { data: subscriptions = [], isLoading: loadingSubs } = useSubscriptions();
  const displayName = profile?.first_name ?? profile?.last_name ?? authUser?.email ?? 'Usuario';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Navbar inside */}
      <section className="bg-[#FFDCE6] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-12 shadow-lg">
            {/* Navbar inside white container */}
            <nav className="mb-8 md:mb-12">
              <div className="flex items-center justify-between">
                <Link to="/home" className="flex items-center">
                  <img 
                    src="/assets/logo woof.svg" 
                    alt="Mishiwoof Logo" 
                    className="h-12 md:h-14"
                  />
                </Link>
                <div className="flex items-center gap-4 md:gap-6">
                  <Link 
                    to="/home" 
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

            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-2">
                Bienvenido{authUser?.email?.endsWith('a') ? 'a' : ''} a la{' '}
                <span className="text-[#FF6F61]">sucursal virtual</span>
              </h1>
              {loadingProfile ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <p className="text-gray-600">{displayName} · {profile?.email ?? authUser?.email}</p>
              )}
            </div>

            {/* Pet Profile Module */}
            <div className="bg-gray-100 rounded-xl p-6 md:p-8 mb-8">
              <h2 className="text-lg font-semibold text-black mb-4">Mis mascotas</h2>
              {loadingPets ? (
                <Skeleton className="h-24 w-full rounded-lg" />
              ) : pets.length === 0 ? (
                <p className="text-gray-600">Aún no tienes mascotas. <Link to="/contratacion" className="text-[#FF6F61] underline">Contratar plan</Link></p>
              ) : (
                <div className="space-y-4">
                  {pets.map((pet) => (
                    <div key={pet.id} className="flex flex-col md:flex-row items-center md:items-start gap-4 bg-white rounded-lg p-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {pet.photo_url ? (
                          <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-black">{pet.name}</p>
                        <p className="text-sm text-gray-700">{pet.species} · {pet.age} años</p>
                        {pet.weight_kg != null && <p className="text-sm text-gray-700">Peso: {pet.weight_kg} kg</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subscriptions */}
            {subscriptions.length > 0 && (
              <div className="bg-gray-100 rounded-xl p-6 md:p-8 mb-8">
                <h2 className="text-lg font-semibold text-black mb-4">Mis suscripciones</h2>
                {loadingSubs ? (
                  <Skeleton className="h-16 w-full rounded-lg" />
                ) : (
                  <ul className="space-y-2">
                    {subscriptions.map((s) => (
                      <li key={s.id} className="flex justify-between items-center bg-white rounded-lg p-3">
                        <span className="font-medium">{s.plan_name ?? s.plan_id}</span>
                        <span className="text-sm text-gray-600">{s.status} · {s.final_price_uf} UF/mes</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Action Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <Link 
                to="/sucursal-virtual" 
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#FF6F61] transition-colors"
              >
                <span className="text-sm md:text-base text-black font-medium">
                  Realizar una bonificación
                </span>
                <svg className="w-5 h-5 text-[#FF6F61]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link 
                to="/sucursal-virtual" 
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#FF6F61] transition-colors"
              >
                <span className="text-sm md:text-base text-black font-medium">
                  Ver estado de mi bonificación
                </span>
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">+</span>
                </div>
              </Link>
              <Link 
                to="/sucursal-virtual" 
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#FF6F61] transition-colors"
              >
                <span className="text-sm md:text-base text-black font-medium">
                  Ver mi cuenta prioritaria
                </span>
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">+</span>
                </div>
              </Link>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <Link 
                to="/sucursal-virtual" 
                className="text-sm md:text-base text-black hover:text-[#FF6F61] transition-colors flex items-center gap-2"
              >
                ¿tienes dudas? escríbenos
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </Link>
              <Button className="bg-[#FF6F61] text-white hover:bg-[#FF6F61]/90 rounded-lg px-6 md:px-8" onClick={() => logout()}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Navigation Card */}
      <section className="bg-[#E0E8FF] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link 
                to="/planes-y-coberturas" 
                className="text-black hover:text-[#FF6F61] transition-colors text-sm md:text-base"
              >
                Ver planes
              </Link>
              <Link 
                to="/contratacion" 
                className="text-black hover:text-[#FF6F61] transition-colors text-sm md:text-base"
              >
                Ir a contratar
              </Link>
              <Link 
                to="/sucursal-virtual" 
                className="text-black hover:text-[#FF6F61] transition-colors text-sm md:text-base flex items-center gap-2"
              >
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
          <Link to="/home" className="flex items-center">
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
