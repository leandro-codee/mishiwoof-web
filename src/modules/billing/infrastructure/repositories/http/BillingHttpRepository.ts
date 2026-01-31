/**
 * Billing HTTP Repository - /api/v1/billing
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type {
  SubscriptionResponse,
  CreateSubscriptionRequest,
  PaymentMethodResponse,
  TokenizePaymentMethodRequest,
  PaymentAttemptResponse,
  ProcessPaymentRequest,
  RetryPaymentRequest,
  CancelSubscriptionRequest,
} from '../../../application/dto/BillingDTO';

const BILLING = '/api/v1/billing';

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

  // Subscriptions
  createSubscription(body: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    return httpClient.post<SubscriptionResponse>(`${BILLING}/subscriptions`, body);
  },

  listSubscriptions(): Promise<SubscriptionResponse[]> {
    return httpClient.get<SubscriptionResponse[]>(`${BILLING}/subscriptions`);
  },

  getSubscription(id: string): Promise<SubscriptionResponse> {
    return httpClient.get<SubscriptionResponse>(`${BILLING}/subscriptions/${id}`);
  },

  processPayment(body: ProcessPaymentRequest): Promise<PaymentAttemptResponse> {
    return httpClient.post<PaymentAttemptResponse>(`${BILLING}/subscriptions/${body.subscription_id}/pay`, body);
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
