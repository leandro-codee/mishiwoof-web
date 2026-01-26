/**
 * HomePage Component
 * 
 * Main home page
 */

import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HomePage() {
  const location = useLocation();
  const isHome = location.pathname === '/home';

  const plans = [
    { id: 1, name: 'Plan 01', subtitle: 'First', image: 'path1 img.svg', color: 'bg-pink-200', dotColor: 'bg-blue-500' },
    { id: 2, name: 'Plan 02', subtitle: 'Only', image: 'path2 img.svg', color: 'bg-blue-200', dotColor: 'bg-blue-500' },
    { id: 3, name: 'Plan 03', subtitle: 'Always', image: 'path3 img.svg', color: 'bg-green-200', dotColor: 'bg-green-500' },
    { id: 4, name: 'Plan 04', subtitle: 'Prime', image: 'path4 img.svg', color: 'bg-yellow-200', dotColor: 'bg-yellow-500' },
    { id: 5, name: 'Plan 05', subtitle: 'Exotic', image: 'path5 img.svg', color: 'bg-purple-200', dotColor: 'bg-purple-500' },
  ];

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
                <Link to="/home" className="flex items-center">
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
                    <Link to="/home">Home</Link>
                  </Button>
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

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 md:mb-6">
                  ¿Quiénes somos?
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
                  irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
                  pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
                  deserunt mollit anim id est laborum.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {plans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className={`${plan.color} h-32 md:h-40 flex items-center justify-center p-4`}>
                      <img 
                        src={`/assets/${plan.image}`} 
                        alt={plan.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg md:text-xl font-bold text-black mb-1">{plan.name}</h3>
                      <p className="text-sm md:text-base font-semibold text-gray-700 mb-3">{plan.subtitle}</p>
                      <div className="flex items-center justify-between">
                        <Link 
                          to="/planes-y-coberturas" 
                          className="text-sm md:text-base text-black hover:text-[#FF6F61] transition-colors flex items-center gap-1"
                        >
                          Más info
                          <span>→</span>
                        </Link>
                        <div className={`w-3 h-3 rounded-full ${plan.dotColor}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
