/**
 * PlanesyCoberturasPage Component
 * 
 * Plans and coverage page - consumes /api/v1/plans
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePlans, usePlan } from '@modules/plans/presentation/hooks/usePlans';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import type { Plan } from '@modules/plans/application/dto/PlanDTO';

const PLAN_COLORS = ['bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200'];
const PLAN_DOT_COLORS = ['bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];

export function PlanesyCoberturasPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPlanes = location.pathname === '/planes-y-coberturas' || location.pathname === '/planes';
  const { isAuthenticated } = useAuth();
  const { data: plans = [], isLoading } = usePlans();
  const firstPlanId = plans.length > 0 ? plans[0].id : undefined;
  const { data: planWithCoverages } = usePlan(firstPlanId, true);
  const displayPlan: Plan | null = planWithCoverages ?? plans[0] ?? null;

  const handleContratar = (planId: string) => {
    if (!isAuthenticated) {
      navigate('/iniciar-sesion', { state: { from: '/contratacion', planId } });
      return;
    }
    navigate('/contratacion', { state: { planId } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Navbar inside */}
      <section className="bg-[#FFDCE6] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-12 shadow-lg">
            {/* Navbar inside white container */}
            <nav className="mb-8 md:mb-12">
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
                    className={`text-sm md:text-base transition-all rounded-full px-4 md:px-6 py-2 border-2 ${
                      location.pathname === '/home'
                        ? 'text-[#FF6F61] font-semibold border-transparent'
                        : 'text-black border-transparent hover:border-violet-500'
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/sucursal-virtual" 
                    className={`text-sm md:text-base transition-all rounded-full px-4 md:px-6 py-2 border-2 ${
                      location.pathname === '/sucursal-virtual'
                        ? 'text-[#FF6F61] font-semibold border-transparent'
                        : 'text-black border-transparent hover:border-violet-500'
                    }`}
                  >
                    Mi cuenta
                  </Link>
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

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left Side - Plan Details */}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 md:mb-6">
                  Planes y coberturas
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>

                {displayPlan && (
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
                    {displayPlan.name}
                  </h2>
                  
                  {/* Tabla de coberturas del plan (datos reales desde API) */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                    <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                      <div className="p-3 font-semibold text-sm md:text-base text-black border-r border-gray-200">Prestación</div>
                      <div className="p-3 font-semibold text-sm md:text-base text-black border-r border-gray-200">Cobertura</div>
                      <div className="p-3 font-semibold text-sm md:text-base text-black">Tope eventos</div>
                    </div>
                    {displayPlan.coverages && displayPlan.coverages.length > 0 ? (
                      displayPlan.coverages.map((c) => (
                        <div key={c.id} className="grid grid-cols-3 border-b border-gray-200 last:border-b-0">
                          <div className="p-3 text-sm md:text-base text-gray-700 border-r border-gray-200">
                            {c.coverageType?.name ?? '—'}
                          </div>
                          <div className="p-3 text-sm md:text-base text-gray-700 border-r border-gray-200">
                            {c.coveragePercentage != null ? `${c.coveragePercentage}%` : '—'}
                          </div>
                          <div className="p-3 text-sm md:text-base text-gray-700">
                            {c.maxAmountPerEventUf != null ? `${c.maxAmountPerEventUf} UF` : c.maxAnnualEvents != null ? `${c.maxAnnualEvents} eventos/año` : '—'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-gray-500 text-center">Sin coberturas cargadas para este plan.</div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Button 
                      asChild
                      className="bg-[#FF6F61] text-white hover:bg-[#FF6F61]/90 rounded-full px-6 md:px-8"
                    >
                      <Link to="/contratacion" state={{ planId: displayPlan.id }}>Contratar</Link>
                    </Button>
                    <Link 
                      to="/sucursal-virtual" 
                      className="text-black hover:text-[#FF6F61] transition-colors text-sm md:text-base flex items-center gap-2"
                    >
                      Recibir asesoría de este plan
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                    </Link>
                  </div>
                </div>
                )}
                {!displayPlan && !isLoading && (
                  <p className="text-gray-500 mb-6">No hay planes disponibles. Contáctanos para más información.</p>
                )}
              </div>

              {/* Right Side - Illustration */}
              <div className="flex justify-center md:justify-end">
                <img 
                  src="/assets/path1 img.svg" 
                  alt="Perros" 
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mishiwoof Planes Section */}
      <section className="bg-[#E0E8FF] px-4 md:px-8 pt-12 md:pt-16 pb-6 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-8 md:mb-12">
              Mishiwoof Planes
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {plans.filter((p) => p.isPublished).map((plan, idx) => (
                  <div 
                    key={plan.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className={`${PLAN_COLORS[idx % PLAN_COLORS.length]} h-32 md:h-40 flex items-center justify-center p-4`}>
                      {plan.imageUrl ? (
                        <img src={plan.imageUrl} alt={plan.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-4xl font-bold text-gray-600">{plan.name.slice(0, 1)}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg md:text-xl font-bold text-black mb-1">{plan.name}</h3>
                      <p className="text-sm md:text-base font-semibold text-gray-700 mb-2">
                        {plan.basePriceUf} UF/mes
                      </p>
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" className="text-[#FF6F61] p-0 h-auto" onClick={() => handleContratar(plan.id)}>
                          Contratar
                        </Button>
                        <div className={`w-3 h-3 rounded-full ${PLAN_DOT_COLORS[idx % PLAN_DOT_COLORS.length]}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#E0E8FF] px-4 md:px-8 pt-4 md:pt-6 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Button 
                asChild
                className="bg-[#FF6F61] text-white hover:bg-[#FF6F61]/90 rounded-full px-6 md:px-8"
              >
                <Link to="/planes-y-coberturas">Ver planes</Link>
              </Button>
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
