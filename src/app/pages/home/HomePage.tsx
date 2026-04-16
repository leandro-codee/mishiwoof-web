/**
 * HomePage Component
 *
 * Main home page
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

export function HomePage() {
  const location = useLocation();
  const isHome = location.pathname === '/inicio' || location.pathname === '/home';
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { data: plansData = [], isLoading: plansLoading } = usePlans(true);
  const { data: ufIndicator } = useIndicatorLatest();
  const ufToday = ufIndicator?.uf_value ?? ufIndicator?.value ?? 0;
  const plans = plansData.filter((p) => p.isPublished);

  const steps = [
    { icon: 'upload-cloud icon.png', text: 'Sube boleta y formulario' },
    { icon: 'calendar icon.png', text: 'Espera tu resolución' },
    { icon: 'bonification icon.png', text: 'Listo, tu bonificación ya se encuentra en su cuenta bancaria registrada' },
  ];

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
                  <Button 
                    asChild
                    className={`${
                      isHome 
                        ? 'bg-[#FF6F61] text-white border-transparent' 
                        : 'bg-transparent text-black border-transparent hover:border-2 hover:border-violet-500'
                    } rounded-full px-4 md:px-6 border-2 transition-all`}
                  >
                    <Link to="/inicio">Home</Link>
                  </Button>
                  {isAuthenticated ? (
                    <>
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
                      <Link to="/iniciar-sesion" className="text-sm md:text-base rounded-full px-4 md:px-6 py-2 border-2 border-transparent hover:border-violet-500">
                        Iniciar sesión
                      </Link>
                      <Button asChild className="bg-[#FF6F61] text-white rounded-full px-4 md:px-6">
                        <Link to="/registro">Registrarse</Link>
                      </Button>
                    </>
                  )}
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

            {/* Hero Tagline */}
            <div className="text-center mb-10 md:mb-14">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                En <span className="text-[#FF6F61]">mishiwoof</span>
                <br />
                cuidamos su salud, para que tú solo te preocupes de darle amor
              </h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 md:mb-6">
                  Somos
                </h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Somos una empresa dedicada al bienestar integral de las mascotas en Chile, especializada en planes de asistencia y salud con cobertura a nivel nacional. Nuestro propósito es apoyar a las familias en la tenencia responsable, facilitando el acceso a servicios veterinarios de calidad, prevención y atención oportuna.
                </p>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mt-4">
                  A través de nuestros planes, buscamos no solo proteger la salud de las mascotas, sino también brindar tranquilidad a sus dueños, promoviendo una mejor calidad de vida, cuidado constante y bienestar para quienes son parte fundamental de cada hogar.
                </p>
              </div>
              <div className="relative flex justify-center md:justify-end">
                <img
                  src="/assets/chica-portada.svg"
                  alt="Mujer con perro"
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mishiwoof Planes and Paso a paso Section */}
      <section className="bg-[#E0E8FF] px-4 md:px-8 pt-12 md:pt-16 pb-6 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            {/* Mishiwoof Planes */}
            <div className="mb-12 md:mb-16">
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

            {/* Paso a paso */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
                <span className="text-[#FF6F61]">Paso a paso </span>
                <span className="text-black">para rendir gasto médico</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center text-center"
                  >
                    <div className="mb-4 md:mb-6">
                      <img 
                        src={`/assets/${step.icon}`} 
                        alt={`Paso ${index + 1}`} 
                        className="w-16 h-16 md:w-20 md:h-20 mx-auto"
                      />
                    </div>
                    <p className="text-sm md:text-base text-gray-700 font-medium">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#E0E8FF] px-4 md:px-8 pt-4 md:pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-black text-center mb-8 md:mb-12">
              ¿Tienes alguna duda?
            </h2>
            <div className="space-y-6 md:space-y-8">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-black mb-2">
                  1. ¿Cómo funciona el plan de asistencia?
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Cada vez que lleves a tu mascota al veterinario y realicen un procedimiento cubierto por el plan, guarda la boleta con el detalle de las prestaciones. Luego, súbela en la sección de solicitud de bonificación en tu cuenta. En un plazo máximo de 4 días hábiles recibirás el reembolso en tu cuenta bancaria registrada.
                </p>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-black mb-2">
                  2. ¿Cuál es el plazo máximo que tengo para generar una bonificación?
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  El plazo máximo es de 60 días contando la fecha desde que se realizó la atención veterinaria la cual se verá reflejada en la boleta entregada por el centro veterinario.
                </p>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-black mb-2">
                  3. ¿Cómo pago mi plan?
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  A través de nuestra web debes realizar el mandato PAC o PAT el cual se hará el cargo mensualmente mientras tengas contrato vigente con mishiwoof.
                </p>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-black mb-2">
                  4. ¿Una vez comienzan los beneficios dónde puedo atender a mi mascota?
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Al ser planes de asistencia modalidad libre elección, puedes ir a cualquier centro veterinario del país, lo importante es que al momento de subir las boletas para rendir gastos, debes estar con beneficios activos.
                </p>
              </div>
            </div>
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
