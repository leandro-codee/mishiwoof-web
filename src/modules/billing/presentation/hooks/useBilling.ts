/**
 * useBilling - payment methods, subscriptions, payments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../../infrastructure/repositories/http/BillingHttpRepository';
import type { ProcessPaymentRequest } from '../../application/dto/BillingDTO';

export const billingKeys = {
  paymentMethods: ['billing', 'payment-methods'] as const,
  subscriptions: ['billing', 'subscriptions'] as const,
  subscription: (id: string) => ['billing', 'subscription', id] as const,
  payments: ['billing', 'payments'] as const,
  payment: (id: string) => ['billing', 'payment', id] as const,
};

export function usePaymentMethods() {
  return useQuery({
    queryKey: billingKeys.paymentMethods,
    queryFn: () => billingApi.listPaymentMethods(),
  });
}

export function useSubscriptions() {
  return useQuery({
    queryKey: billingKeys.subscriptions,
    queryFn: () => billingApi.listSubscriptions(),
  });
}

export function useSubscription(id: string | undefined | null) {
  return useQuery({
    queryKey: billingKeys.subscription(id ?? ''),
    queryFn: () => billingApi.getSubscription(id!),
    enabled: !!id,
  });
}

export function usePaymentHistory() {
  return useQuery({
    queryKey: billingKeys.payments,
    queryFn: () => billingApi.listPaymentHistory(),
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.createSubscription.bind(billingApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.subscriptions }),
  });
}

export function useCreateSubscriptionBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.createSubscriptionBatch.bind(billingApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.subscriptions }),
  });
}

export type ProcessPaymentMutationBody = Omit<ProcessPaymentRequest, 'subscriptionId'> & {
  subscriptionId?: string;
};

export function useProcessPayment(subscriptionId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProcessPaymentMutationBody) => {
      const sid = body.subscriptionId ?? subscriptionId;
      if (!sid) {
        throw new Error('subscriptionId is required');
      }
      if (!body.cardToken?.trim()) {
        throw new Error('cardToken es obligatorio para procesar el pago');
      }
      return billingApi.processPayment({
        subscriptionId: sid,
        paymentMethodId: body.paymentMethodId,
        cardToken: body.cardToken.trim(),
        idempotencyKey: body.idempotencyKey,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingKeys.subscriptions });
      qc.invalidateQueries({ queryKey: billingKeys.payments });
    },
  });
}

export type ProcessSubscriptionBatchPayBody = {
  batchId: string;
  cardToken: string;
  idempotencyKey: string;
};

export function useProcessSubscriptionBatchPay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProcessSubscriptionBatchPayBody) => {
      if (!body.cardToken?.trim()) {
        throw new Error('cardToken es obligatorio para procesar el pago');
      }
      return billingApi.processSubscriptionBatchPay(body.batchId, {
        cardToken: body.cardToken.trim(),
        idempotencyKey: body.idempotencyKey,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingKeys.subscriptions });
      qc.invalidateQueries({ queryKey: billingKeys.payments });
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      billingApi.cancelSubscription(id, reason ? { reason } : undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.subscriptions }),
  });
}

export function useTokenizePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.tokenizePaymentMethod.bind(billingApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.paymentMethods }),
  });
}

export function useSetPrimaryPaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.setPrimaryPaymentMethod.bind(billingApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.paymentMethods }),
  });
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.deletePaymentMethod.bind(billingApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.paymentMethods }),
  });
}
