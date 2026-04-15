/**
 * C2: crear suscripción. C3: PayCvvForm con CVV + card_token (tarjeta ya guardada).
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateSubscription, usePaymentMethods } from '../hooks/useBilling';
import { PayCvvForm } from './PayCvvForm';
import type {
  BillingPaymentProvider,
  PaymentAttemptResponse,
  SubscriptionResponse,
} from '../../application/dto/BillingDTO';
import { getValidationDetails } from '@shared/infrastructure/http/api.error';
import {
  extractExistingSubscriptionIdFrom409,
  getSubscriptionCreateErrorMessage,
} from '../../application/subscription-conflict';
import { toast } from 'sonner';

export type SubscribePetFormProps = {
  petId: string;
  planId: string;
  couponCode?: string;
  paymentProvider?: BillingPaymentProvider;
  onSuccess?: (subscription: SubscriptionResponse) => void;
  className?: string;
};

export function SubscribePetForm({
  petId,
  planId,
  couponCode,
  paymentProvider = 'MERCADOPAGO',
  onSuccess,
  className,
}: SubscribePetFormProps) {
  const createSub = useCreateSubscription();
  const { data: paymentMethods = [] } = usePaymentMethods();
  /** Id para POST .../subscriptions/:id/pay (alta nueva o 409 con PENDING existente). */
  const [subscriptionIdForPay, setSubscriptionIdForPay] = useState<string | null>(null);
  const [createdSub, setCreatedSub] = useState<SubscriptionResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const primaryPm =
    paymentMethods.find((pm) => pm.isPrimary) ?? paymentMethods[0] ?? null;

  const handleCreateSubscription = async () => {
    setFieldErrors({});
    try {
      const sub = await createSub.mutateAsync({
        petId,
        planId,
        paymentProvider,
        ...(couponCode?.trim() ? { couponCode: couponCode.trim() } : {}),
      });
      setCreatedSub(sub);
      setSubscriptionIdForPay(sub.id);
      toast.success('Suscripción creada. Ingresa el CVV para completar el pago.');
    } catch (err) {
      const existingId = extractExistingSubscriptionIdFrom409(err);
      if (existingId) {
        setCreatedSub(null);
        setSubscriptionIdForPay(existingId);
        toast.info(
          'Ya había una suscripción abierta (PENDING). No repitas el alta: ingresa el CVV para completar el pago.',
        );
        return;
      }
      const details = getValidationDetails(err);
      if (details) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(details)) {
          flat[k] = (v as string[])[0] ?? '';
        }
        setFieldErrors(flat);
        toast.error('Revisa los datos e inténtalo de nuevo.');
      } else {
        toast.error(getSubscriptionCreateErrorMessage(err));
      }
    }
  };

  const handlePaySuccess = (_attempt: PaymentAttemptResponse) => {
    if (!subscriptionIdForPay) return;
    const payload =
      createdSub ??
      ({
        id: subscriptionIdForPay,
        petId,
        planId,
        status: 'PENDING',
        billingPeriodStart: '',
        nextBillingDate: '',
        basePriceUf: 0,
        appliedMultiplier: 1,
        finalPriceUf: 0,
        enterpriseShareUf: 0,
        memberShareUf: 0,
        paymentProvider,
        createdAt: '',
        updatedAt: '',
      } as SubscriptionResponse);
    onSuccess?.(payload);
  };

  return (
    <div className={className}>
      {(fieldErrors.pet_id || fieldErrors.plan_id || fieldErrors.subscription_id) && (
        <p className="text-sm text-red-600 mb-3">
          {fieldErrors.pet_id ?? fieldErrors.plan_id ?? fieldErrors.subscription_id}
        </p>
      )}

      {!subscriptionIdForPay && (
        <Button
          type="button"
          className="w-full bg-[#FF6F61] text-white"
          onClick={handleCreateSubscription}
          disabled={createSub.isPending || !petId || !planId || !primaryPm}
        >
          {createSub.isPending ? 'Creando suscripción...' : 'Crear suscripción'}
        </Button>
      )}

      {!primaryPm && !subscriptionIdForPay && (
        <p className="text-sm text-amber-700 mt-2">No hay método de pago guardado.</p>
      )}

      {subscriptionIdForPay && primaryPm && (
        <PayCvvForm
          subscriptionId={subscriptionIdForPay}
          paymentMethod={primaryPm}
          onSuccess={handlePaySuccess}
        />
      )}

      {subscriptionIdForPay && !primaryPm && (
        <p className="text-sm text-red-600 mt-2">
          No hay método de pago guardado. Agrega una tarjeta en Mi cuenta y vuelve a intentar.
        </p>
      )}
    </div>
  );
}
