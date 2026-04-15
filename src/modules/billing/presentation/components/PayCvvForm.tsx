/**
 * C3 con tarjeta guardada: CVV en campo seguro MP → card_token → POST .../pay
 */

import { useEffect, useId } from 'react';
import { useMercadoPago } from '../hooks/useMercadoPago';
import { useProcessPayment, useProcessSubscriptionBatchPay } from '../hooks/useBilling';
import type { PaymentAttemptResponse, PaymentMethodResponse } from '../../application/dto/BillingDTO';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getErrorMessage } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';

export type PayCvvFormProps = {
  /** Una suscripción (flujo unitario). */
  subscriptionId?: string;
  /** Lote: un solo cobro para varias suscripciones. */
  batchId?: string;
  paymentMethod: PaymentMethodResponse;
  onSuccess?: (attempt: PaymentAttemptResponse) => void;
  className?: string;
};

function toastForAttempt(attempt: PaymentAttemptResponse, opts?: { multiplePets?: boolean }) {
  const s = String(attempt.status).toUpperCase();
  if (s === 'SUCCESS') {
    toast.success(
      opts?.multiplePets
        ? 'Pago exitoso, tus mascotas quedaron cubiertas'
        : 'Pago exitoso, tu mascota está cubierta',
    );
    return;
  }
  if (s === 'FAILED') {
    toast.error(attempt.errorMessage ?? 'Pago rechazado, intenta de nuevo');
    return;
  }
  if (s === 'PENDING') {
    toast.info('Pago en proceso, te notificaremos');
    return;
  }
  toast.success('Pago registrado');
}

export function PayCvvForm({ subscriptionId, batchId, paymentMethod, onSuccess, className }: PayCvvFormProps) {
  const cvvContainerId = useId().replace(/:/g, '');
  const { ready, mountCvvField, createTokenFromCardId, publicKeyConfigured } = useMercadoPago();
  const processPay = useProcessPayment(subscriptionId);
  const processBatchPay = useProcessSubscriptionBatchPay();
  const isBatch = Boolean(batchId);

  const cardId = paymentMethod.providerPaymentMethodId?.trim();

  useEffect(() => {
    if (!ready || !publicKeyConfigured || !cardId) {
      return;
    }

    let unmount: (() => void) | undefined;
    try {
      unmount = mountCvvField(cvvContainerId);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }

    return () => {
      unmount?.();
    };
  }, [ready, publicKeyConfigured, cardId, cvvContainerId, mountCvvField]);

  const handlePay = async () => {
    if (!cardId) {
      toast.error('Esta tarjeta no tiene identificador del proveedor; vuelve a agregarla.');
      return;
    }
    if (!subscriptionId && !batchId) {
      toast.error('Falta subscriptionId o batchId para procesar el pago.');
      return;
    }
    try {
      const cardToken = await createTokenFromCardId(cardId);
      const idempotencyKey = crypto.randomUUID();
      const attempt = batchId
        ? await processBatchPay.mutateAsync({ batchId, cardToken, idempotencyKey })
        : await processPay.mutateAsync({
            subscriptionId: subscriptionId!,
            cardToken,
            idempotencyKey,
          });
      toastForAttempt(attempt, { multiplePets: isBatch });
      onSuccess?.(attempt);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!publicKeyConfigured) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Configuración</AlertTitle>
        <AlertDescription>
          Falta <code className="text-xs">VITE_MP_PUBLIC_KEY</code> para cobrar con Mercado Pago.
        </AlertDescription>
      </Alert>
    );
  }

  if (!cardId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Tarjeta no usable para CVV</AlertTitle>
        <AlertDescription>
          El backend debe devolver <code className="text-xs">providerPaymentMethodId</code> (card_id de MP)
          en el método de pago.
        </AlertDescription>
      </Alert>
    );
  }

  const brand = paymentMethod.cardBrand ?? 'Tarjeta';
  const last4 = paymentMethod.last4 ?? '****';

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <div>
        <p className="text-sm text-muted-foreground">
          Tarjeta: <span className="font-medium text-foreground">{brand}</span> ****{last4}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ingresa el CVV para confirmar el cobro (requerido en Chile por normativa PCI).
        </p>
      </div>

      <div className="space-y-2">
        <Label>Código de seguridad (CVV)</Label>
        <div
          id={cvvContainerId}
          className="min-h-[48px] rounded-md border border-input bg-background px-2 py-1"
        />
      </div>

      <Button
        type="button"
        className="w-full bg-[#FF6F61] text-white"
        onClick={handlePay}
        disabled={!ready || processPay.isPending || processBatchPay.isPending}
      >
        {processPay.isPending || processBatchPay.isPending ? 'Procesando...' : 'Pagar'}
      </Button>

      {!ready && <p className="text-xs text-muted-foreground">Cargando Mercado Pago…</p>}
    </div>
  );
}
