/**
 * SucursalVirtualPage Component
 * 
 * Virtual branch page
 */

import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function SucursalVirtualPage() {
  const location = useLocation();
  const isSucursal = location.pathname === '/sucursal-virtual';

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
                Bienvenido a la{' '}
                <span className="text-[#FF6F61]">sucursal virtual</span>
              </h1>
            </div>

            {/* Pet Profile Module */}
            <div className="bg-gray-100 rounded-xl p-6 md:p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden bg-white flex-shrink-0">
                  <img 
                    src="/assets/gato_fondo.png" 
                    alt="Mascota" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <p className="text-base md:text-lg font-semibold text-black">
                    Nombre Mascota
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    Edad
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    Peso
                  </p>
                </div>
              </div>
            </div>

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
              <Button className="bg-[#FF6F61] text-white hover:bg-[#FF6F61]/90 rounded-lg px-6 md:px-8">
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
