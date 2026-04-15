/**
 * Billing HTTP Repository - /api/v1/billing
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type {
  SubscriptionResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionBatchRequest,
  SubscriptionBatchResponse,
  PaymentMethodResponse,
  TokenizePaymentMethodRequest,
  PaymentAttemptResponse,
  ProcessPaymentRequest,
  RetryPaymentRequest,
  CancelSubscriptionRequest,
} from '../../../application/dto/BillingDTO';

const BILLING = '/billing';

export const billingApi = {
  // Payment methods
  tokenizePaymentMethod(body: TokenizePaymentMethodRequest): Promise<PaymentMethodResponse> {
    return httpClient.post<PaymentMethodResponse>(`${BILLING}/payment-methods`, body);
  },

  listPaymentMethods(): Promise<PaymentMethodResponse[]> {
    return httpClient.get<PaymentMethodResponse[]>(`${BILLING}/payment-methods`);
  },

  setPrimaryPaymentMethod(paymentMethodId: string): Promise<void> {
    return httpClient.post(`${BILLING}/payment-methods/primary`, { payment_method_id: paymentMethodId });
  },

  setBackupPaymentMethod(paymentMethodId: string): Promise<void> {
    return httpClient.post(`${BILLING}/payment-methods/backup`, { payment_method_id: paymentMethodId });
  },

  deletePaymentMethod(id: string): Promise<void> {
    return httpClient.delete(`${BILLING}/payment-methods/${id}`);
  },

  /**
   * Suscripciones: un solo POST /subscriptions sirve para 1 o N líneas (mascota+plan).
   * Así los cambios de contrato van contra un único endpoint; el cuerpo distingue unitario vs `items`.
   * Cobro lote: POST /subscriptions/batch/:id/pay (misma forma de body que el pago unitario).
   */
  createSubscription(body: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    return httpClient.post<SubscriptionResponse>(`${BILLING}/subscriptions`, body);
  },

  /** Cuerpo con `items` → varias suscripciones PENDING; misma URL que createSubscription. */
  createSubscriptionBatch(body: CreateSubscriptionBatchRequest): Promise<SubscriptionBatchResponse> {
    return httpClient.post<SubscriptionBatchResponse>(`${BILLING}/subscriptions`, body);
  },

  listSubscriptions(): Promise<SubscriptionResponse[]> {
    return httpClient.get<SubscriptionResponse[]>(`${BILLING}/subscriptions`);
  },

  getSubscription(id: string): Promise<SubscriptionResponse> {
    return httpClient.get<SubscriptionResponse>(`${BILLING}/subscriptions/${id}`);
  },

  processPayment(body: ProcessPaymentRequest): Promise<PaymentAttemptResponse> {
    return httpClient.post<PaymentAttemptResponse>(`${BILLING}/subscriptions/${body.subscriptionId}/pay`, body);
  },

  /** Misma forma que el pago unitario; `:id` es el id del batch (raíz de la respuesta al crear el lote). */
  processSubscriptionBatchPay(
    batchId: string,
    body: Pick<ProcessPaymentRequest, 'cardToken' | 'idempotencyKey'>,
  ): Promise<PaymentAttemptResponse> {
    return httpClient.post<PaymentAttemptResponse>(`${BILLING}/subscriptions/batch/${batchId}/pay`, body);
  },

  retryPayment(subscriptionId: string, body: RetryPaymentRequest): Promise<PaymentAttemptResponse> {
    return httpClient.post<PaymentAttemptResponse>(`${BILLING}/subscriptions/${subscriptionId}/retry`, body);
  },

  cancelSubscription(id: string, body?: CancelSubscriptionRequest): Promise<void> {
    return httpClient.delete(`${BILLING}/subscriptions/${id}`, { data: body });
  },

  // Payment history
  listPaymentHistory(): Promise<PaymentAttemptResponse[]> {
    return httpClient.get<PaymentAttemptResponse[]>(`${BILLING}/payments`);
  },

  getPaymentAttempt(id: string): Promise<PaymentAttemptResponse> {
    return httpClient.get<PaymentAttemptResponse>(`${BILLING}/payments/${id}`);
  },
};
