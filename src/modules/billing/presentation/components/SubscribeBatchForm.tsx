/**
 * Varios pares mascota+plan: crear lote (C2) y un solo pago con CVV (C3).
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateSubscriptionBatch, usePaymentMethods } from '../hooks/useBilling';
import { PayCvvForm } from './PayCvvForm';
import type {
  BillingPaymentProvider,
  PaymentAttemptResponse,
  SubscriptionBatchItem,
  SubscriptionBatchResponse,
} from '../../application/dto/BillingDTO';
import { getValidationDetails } from '@shared/infrastructure/http/api.error';
import {
  extractExistingBatchResponseFrom409,
  getSubscriptionCreateErrorMessage,
} from '../../application/subscription-conflict';
import { toast } from 'sonner';

export type SubscribeBatchFormProps = {
  items: SubscriptionBatchItem[];
  couponCode?: string;
  paymentProvider?: BillingPaymentProvider;
  onSuccess?: (batch: SubscriptionBatchResponse) => void;
  className?: string;
};

export function SubscribeBatchForm({
  items,
  couponCode,
  paymentProvider = 'MERCADOPAGO',
  onSuccess,
  className,
}: SubscribeBatchFormProps) {
  const createBatch = useCreateSubscriptionBatch();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const [pendingBatch, setPendingBatch] = useState<SubscriptionBatchResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const primaryPm =
    paymentMethods.find((pm) => pm.isPrimary) ?? paymentMethods[0] ?? null;

  const handleCreateBatch = async () => {
    setFieldErrors({});
    try {
      const batch = await createBatch.mutateAsync({
        items,
        paymentProvider,
        ...(couponCode?.trim() ? { couponCode: couponCode.trim() } : {}),
      });
      setPendingBatch(batch);
      toast.success('Orden lista. Ingresa el CVV para completar el pago único.');
    } catch (err) {
      const existing = extractExistingBatchResponseFrom409(err);
      if (existing) {
        setPendingBatch(existing);
        toast.info(
          'Ya tenías esta orden pendiente de pago (PENDING). Completa el CVV abajo; no hace falta crear otra alta.',
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
    if (pendingBatch) {
      onSuccess?.(pendingBatch);
    }
  };

  const canSubmit = items.length > 0 && !!primaryPm;

  return (
    <div className={className}>
      {(fieldErrors.items ||
        fieldErrors.pet_ids ||
        fieldErrors.petIds ||
        fieldErrors.plan_id ||
        fieldErrors.batch_id) && (
        <p className="text-sm text-red-600 mb-3">
          {fieldErrors.items ??
            fieldErrors.pet_ids ??
            fieldErrors.petIds ??
            fieldErrors.plan_id ??
            fieldErrors.batch_id}
        </p>
      )}

      {!pendingBatch && (
        <Button
          type="button"
          className="w-full bg-[#FF6F61] text-white"
          onClick={handleCreateBatch}
          disabled={createBatch.isPending || !canSubmit}
        >
          {createBatch.isPending
            ? 'Creando orden de pago...'
            : items.length > 1
              ? 'Crear orden de pago (varias líneas)'
              : 'Crear orden de pago'}
        </Button>
      )}

      {!primaryPm && !pendingBatch && (
        <p className="text-sm text-amber-700 mt-2">No hay método de pago guardado.</p>
      )}

      {pendingBatch && primaryPm && (
        <PayCvvForm
          batchId={pendingBatch.id}
          paymentMethod={primaryPm}
          onSuccess={handlePaySuccess}
        />
      )}

      {pendingBatch && !primaryPm && (
        <p className="text-sm text-red-600 mt-2">
          No hay método de pago guardado. Agrega una tarjeta en Mi cuenta y vuelve a intentar.
        </p>
      )}
    </div>
  );
}
