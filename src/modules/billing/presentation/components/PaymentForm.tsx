/**
 * Pago con Mercado Pago Card Payment Brick → tokenizar método → crear lote de suscripciones → un solo cobro.
 */

import { useEffect, useId, useRef } from 'react';
import { useMercadoPago, type CardPaymentBrickFormData } from '../hooks/useMercadoPago';
import {
  useTokenizePaymentMethod,
  useCreateSubscriptionBatch,
  useProcessSubscriptionBatchPay,
} from '../hooks/useBilling';
import type { BillingPaymentProvider, SubscriptionBatchItem } from '../../application/dto/BillingDTO';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getErrorMessage, isApiError } from '@shared/infrastructure/http/api.error';
import {
  extractExistingBatchIdFrom409,
  getSubscriptionCreateErrorMessage,
} from '../../application/subscription-conflict';
import { toast } from 'sonner';

export type PaymentFormProps = {
  /** Una o más pares mascota+plan: POST .../subscriptions (lote) luego POST .../subscriptions/batch/:id/pay. */
  items: SubscriptionBatchItem[];
  couponCode?: string;
  paymentProvider?: BillingPaymentProvider;
  /** Se llama tras tokenizar, crear suscripción y cobrar con éxito. */
  onSuccess?: () => void;
  /**
   * Monto en moneda local que recibe el Brick (CLP). El cobro real lo ejecuta el backend con la suscripción.
   */
  brickAmount?: number;
};

function brickPayloadFromFormData(formData: CardPaymentBrickFormData): {
  cardToken: string;
  cardholderName: string;
  payerEmail: string;
} {
  const cardToken = typeof formData.token === 'string' ? formData.token.trim() : '';
  const payer = formData.payer;
  const payerEmail = String(payer?.email ?? '').trim();
  const fromPayerName = [payer?.first_name, payer?.last_name].filter(Boolean).join(' ').trim();
  const cardholderName =
    String((formData.cardholderName ?? fromPayerName) || 'APRO').trim() || 'APRO';
  return { cardToken, cardholderName, payerEmail };
}

export function PaymentForm({
  items,
  couponCode,
  paymentProvider = 'MERCADOPAGO',
  onSuccess,
  brickAmount = 100,
}: PaymentFormProps) {
  const brickContainerId = useId().replace(/:/g, '');
  const { ready, mountCardPaymentBrick, publicKeyConfigured } = useMercadoPago();
  const tokenize = useTokenizePaymentMethod();
  const createBatch = useCreateSubscriptionBatch();
  const processBatchPay = useProcessSubscriptionBatchPay();

  const itemsKey = items
    .map((i) => `${i.petId}:${i.planId}`)
    .sort()
    .join('|');
  const planRef = useRef({ items, couponCode, brickAmount, paymentProvider });
  planRef.current = { items, couponCode, brickAmount, paymentProvider };

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const mutationsRef = useRef({ tokenize, createBatch, processBatchPay });
  mutationsRef.current = { tokenize, createBatch, processBatchPay };

  useEffect(() => {
    if (!ready || !publicKeyConfigured) {
      return;
    }

    let cancelled = false;
    let unmountBrick: (() => void) | undefined;

    void (async () => {
      try {
        const unmount = await mountCardPaymentBrick(brickContainerId, {
          amount: planRef.current.brickAmount ?? 100,
          onSubmit: async (formData: CardPaymentBrickFormData) => {
            try {
              const { tokenize: tz, createBatch: cb, processBatchPay: pay } = mutationsRef.current;
              const { items: batchItems, couponCode: coupon, paymentProvider: provider } =
                planRef.current;

              const { cardToken, cardholderName, payerEmail } = brickPayloadFromFormData(formData);
              if (!cardToken) {
                throw new Error('No se recibió token de tarjeta desde Mercado Pago');
              }
              if (!payerEmail || !payerEmail.includes('@')) {
                throw new Error('Indica un email válido del pagador en el formulario del Brick');
              }
              if (!batchItems.length) {
                throw new Error('Agrega al menos una mascota con plan al contrato');
              }

              await tz.mutateAsync({
                cardToken,
                cardholderName,
                payerEmail,
                isPrimary: true,
                isBackup: false,
              });

              let batchId: string;
              try {
                const batch = await cb.mutateAsync({
                  items: batchItems,
                  paymentProvider: provider,
                  ...(coupon?.trim() ? { couponCode: coupon.trim() } : {}),
                });
                batchId = batch.id;
              } catch (e) {
                if (isApiError(e) && e.isConflict()) {
                  const reuse = extractExistingBatchIdFrom409(e);
                  if (reuse) {
                    batchId = reuse;
                    toast.info(
                      'Ya existía una orden pendiente de pago (PENDING). Se continúa solo con el cobro, sin repetir el alta.',
                    );
                  } else {
                    toast.error(getSubscriptionCreateErrorMessage(e));
                    throw e;
                  }
                } else {
                  toast.error(
                    isApiError(e) && e.isForbidden()
                      ? getSubscriptionCreateErrorMessage(e)
                      : getErrorMessage(e),
                  );
                  throw e;
                }
              }

              await pay.mutateAsync({
                batchId,
                cardToken,
                idempotencyKey: crypto.randomUUID(),
              });

              toast.success(
                batchItems.length > 1
                  ? 'Suscripciones activas y un solo pago procesado'
                  : 'Suscripción activa y pago procesado',
              );
              onSuccessRef.current?.();
            } catch (e) {
              toast.error(getErrorMessage(e));
              throw e;
            }
          },
          onError: (err) => {
            toast.error(getErrorMessage(err));
          },
        });

        if (cancelled) {
          unmount();
          return;
        }
        unmountBrick = unmount;
      } catch (e) {
        toast.error(getErrorMessage(e));
      }
    })();

    return () => {
      cancelled = true;
      unmountBrick?.();
    };
  }, [
    ready,
    publicKeyConfigured,
    brickContainerId,
    mountCardPaymentBrick,
    brickAmount,
    paymentProvider,
    itemsKey,
  ]);

  if (!publicKeyConfigured) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Falta configuración</AlertTitle>
        <AlertDescription>
          Define <code className="text-xs">VITE_MP_PUBLIC_KEY</code> en tu archivo{' '}
          <code className="text-xs">.env</code> para cargar Mercado Pago.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {!ready && (
        <p className="text-sm text-muted-foreground">Cargando Mercado Pago…</p>
      )}
      <div
        id={brickContainerId}
        className="min-h-[320px] rounded-lg border border-border bg-card p-2"
      />
    </div>
  );
}
