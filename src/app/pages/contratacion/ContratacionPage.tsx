/**
 * ContratacionPage Component
 * 
 * Contracting page
 */

import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ContratacionPage() {
  const location = useLocation();

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
                      location.pathname === '/planes-y-coberturas'
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
              {/* Left Side - Form */}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-2">
                  Contratación
                </h1>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#FF6F61] mb-8">
                  Plan First
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-black mb-2">
                      Nombre del Titular
                    </label>
                    <Input 
                      type="text" 
                      placeholder="Nombre del Titular"
                      className="w-full bg-gray-100 rounded-lg"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-black mb-4">
                      Datos de la mascota
                    </h3>
                    <div className="space-y-4">
                      <Input 
                        type="text" 
                        placeholder="Nombre Mascota"
                        className="w-full bg-gray-100 rounded-lg"
                      />
                      <Select>
                        <SelectTrigger className="w-full bg-gray-100 rounded-lg">
                          <SelectValue placeholder="Gato / Perro" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="perro">Perro</SelectItem>
                          <SelectItem value="gato">Gato</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        type="text" 
                        placeholder="Edad"
                        className="w-full bg-gray-100 rounded-lg"
                      />
                      <Input 
                        type="text" 
                        placeholder="Peso Apróx."
                        className="w-full bg-gray-100 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-black hover:text-[#FF6F61] transition-colors cursor-pointer">
                    <span className="text-sm md:text-base">Agregar otra mascota</span>
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-bold">+</span>
                    </div>
                  </div>

                  <Button className="w-full bg-[#FF6F61] text-white hover:bg-[#FF6F61]/90 rounded-lg py-6 text-base md:text-lg">
                    Enviar
                  </Button>
                </div>
              </div>

              {/* Right Side - Illustration and Plan Details */}
              <div className="relative">
                <div className="flex justify-center md:justify-end mb-6">
                  <img 
                    src="/assets/path1 img.svg" 
                    alt="Perro y gato" 
                    className="w-full max-w-md h-auto"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-base md:text-lg font-semibold text-black">
                    Valor Plan Mensual
                  </p>
                  <p className="text-sm md:text-base text-black">
                    Pagar con descuento automático
                  </p>
                </div>
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
