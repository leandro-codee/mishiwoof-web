/**
 * useBilling - payment methods, subscriptions, payments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../../infrastructure/repositories/http/BillingHttpRepository';

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

export function useProcessPayment(subscriptionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { payment_method_id?: string; idempotency_key: string }) =>
      billingApi.processPayment({ subscription_id: subscriptionId, ...body }),
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
