/**
 * PaymentPage
 *
 * Página dedicada para regularizar una suscripción con pago pendiente.
 * Recibe el subscriptionId por query param: /pagos?suscripcion=<id>
 */

import { useSearchParams, Link } from 'react-router-dom';
import { useSubscriptions, usePaymentMethods } from '@modules/billing/presentation/hooks/useBilling';
import { PayCvvForm } from '@modules/billing/presentation/components/PayCvvForm';
import { Skeleton } from '@/components/ui/skeleton';

export function PaymentPage() {
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('suscripcion');

  const { data: subscriptions = [], isLoading: loadingSubs } = useSubscriptions();
  const { data: paymentMethods = [], isLoading: loadingPM } = usePaymentMethods();

  const subscription = subscriptions.find((s) => s.id === subscriptionId);
  const primaryPaymentMethod =
    paymentMethods.find((pm) => pm.isPrimary) ?? paymentMethods[0] ?? null;

  const isLoading = loadingSubs || loadingPM;

  return (
    <div className="min-h-screen bg-[#FFDCE6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Back */}
          <Link
            to="/sucursal-virtual"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF6F61] transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a mi cuenta
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : !subscription ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No se encontró la suscripción.</p>
              <Link to="/sucursal-virtual" className="text-[#FF6F61] underline text-sm">
                Volver a mi cuenta
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium px-2.5 py-1 rounded-full mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  Pago pendiente
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  Regularizar suscripción
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Plan{' '}
                  <span className="font-medium text-gray-700">
                    {subscription.planName ?? subscription.planId}
                  </span>{' '}
                  · {subscription.finalPriceUf} UF/mes
                </p>
              </div>

              {/* Form or no payment method */}
              {primaryPaymentMethod ? (
                <div className="space-y-4">
                  {/* Card info */}
                  <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {primaryPaymentMethod.cardBrand ?? 'Tarjeta'} ···· {primaryPaymentMethod.lastFour ?? '****'}
                      </p>
                      <p className="text-xs text-gray-400">Método de pago principal</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    Ingresa el CVV de tu tarjeta para reintentar el cobro.
                  </p>

                  <PayCvvForm
                    subscriptionId={subscription.id}
                    paymentMethod={primaryPaymentMethod}
                  />
                </div>
              ) : (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
                  No tienes un método de pago registrado.{' '}
                  <Link to="/sucursal-virtual" className="underline font-medium">
                    Agrega uno en tu cuenta
                  </Link>{' '}
                  para poder regularizar esta suscripción.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}