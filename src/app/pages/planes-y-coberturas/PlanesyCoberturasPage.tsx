/**
 * PlanesyCoberturasPage — versión reducida.
 *
 * Muestra únicamente la sección "Mishiwoof Planes" (mismo tratamiento visual
 * que en HomePage) más el navbar y el footer para mantener navegación y branding.
 */

import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import { usePlans } from '@modules/plans/presentation/hooks/usePlans';
import { useIndicatorLatest } from '@modules/indicators/presentation/hooks/useIndicators';

const PLAN_CARD_COLORS = ['bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200'];
const PLAN_DOT_COLORS = ['bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
const PLAN_FALLBACK_IMAGES = ['path1 img.svg', 'path2 img.svg', 'path3 img.svg', 'path4 img.svg', 'path5 img.svg'];

function formatUF(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function PlanesyCoberturasPage() {
  const location = useLocation();
  const isPlanes =
    location.pathname === '/planes-y-coberturas' || location.pathname === '/planes';
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { data: plansData = [], isLoading: plansLoading } = usePlans(true);
  const { data: ufIndicator } = useIndicatorLatest();
  const ufToday = ufIndicator?.uf_value ?? ufIndicator?.value ?? 0;
  const plans = plansData.filter((p) => p.isPublished);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <section className="bg-[#FFDCE6] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-12 shadow-lg">
            <nav>
              <div className="flex items-center justify-between">
                <Link to="/inicio" className="flex items-center">
                  <img
                    src="/assets/logo woof.svg"
                    alt="Mishiwoof Logo"
                    className="h-12 md:h-14"
                  />
                </Link>
                <div className="flex items-center gap-4 md:gap-6">
                  <Link
                    to="/inicio"
                    className="text-sm md:text-base transition-all rounded-full px-4 md:px-6 py-2 border-2 text-black border-transparent hover:border-violet-500"
                  >
                    Home
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/sucursal-virtual"
                        className="text-sm md:text-base transition-all rounded-full px-4 md:px-6 py-2 border-2 text-black border-transparent hover:border-violet-500"
                      >
                        Mi cuenta
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="text-sm md:text-base rounded-full px-4 md:px-6 py-2 border-2 border-transparent hover:border-violet-500 text-gray-700 hover:text-[#FF6F61]"
                        >
                          Admin
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        to="/iniciar-sesion"
                        className="text-sm md:text-base rounded-full px-4 md:px-6 py-2 border-2 border-transparent hover:border-violet-500"
                      >
                        Iniciar sesión
                      </Link>
                      <Button asChild className="bg-[#FF6F61] text-white rounded-full px-4 md:px-6">
                        <Link to="/registro">Registrarse</Link>
                      </Button>
                    </>
                  )}
                  <Button
                    asChild
                    className={`${
                      isPlanes
                        ? 'bg-[#FF6F61] text-white border-transparent'
                        : 'bg-transparent text-black border-transparent hover:border-2 hover:border-violet-500'
                    } rounded-full px-4 md:px-6 border-2 transition-all`}
                  >
                    <Link to="/planes-y-coberturas">Ver planes</Link>
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </section>

      {/* Mishiwoof Planes — misma sección que HomePage */}
      <section className="bg-[#E0E8FF] px-4 md:px-8 pt-12 md:pt-16 pb-8 md:pb-12 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-8 md:mb-12">
              Mishiwoof Planes
            </h2>
            {plansLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <p className="text-center text-gray-500">
                No hay planes publicados por el momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {plans.map((plan, idx) => {
                  const cardColor = PLAN_CARD_COLORS[idx % PLAN_CARD_COLORS.length];
                  const dotColor = PLAN_DOT_COLORS[idx % PLAN_DOT_COLORS.length];
                  const fallbackImage = PLAN_FALLBACK_IMAGES[idx % PLAN_FALLBACK_IMAGES.length];
                  const priceCLP = ufToday > 0 ? plan.basePriceUf * ufToday : 0;
                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col"
                    >
                      <div className={`${cardColor} h-32 md:h-40 flex items-center justify-center p-4`}>
                        {plan.imageUrl ? (
                          <img
                            src={plan.imageUrl}
                            alt={plan.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img
                            src={`/assets/${fallbackImage}`}
                            alt={plan.name}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-black mb-1">{plan.name}</h3>
                        <p className="text-sm md:text-base font-semibold text-[#FF6F61]">
                          {formatUF(plan.basePriceUf)} UF/mes
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 mb-3">
                          {priceCLP > 0 ? `~ ${formatCLP(priceCLP)} CLP` : 'Precio CLP no disponible'}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <Link
                            to={`/planes/${plan.id}`}
                            className="text-sm md:text-base text-black hover:text-[#FF6F61] transition-colors flex items-center gap-1"
                          >
                            Más info
                            <span>→</span>
                          </Link>
                          <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
