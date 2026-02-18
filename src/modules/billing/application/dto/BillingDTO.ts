/**
 * Billing DTOs - /api/v1/billing (payment methods, subscriptions, payments)
 */

export interface SubscriptionResponse {
  id: string;
  petId: string;
  planId: string;
  planName?: string;
  enterpriseMembershipId?: string;
  status: string;
  billingPeriodStart: string;
  nextBillingDate: string;
  basePriceUf: number;
  appliedMultiplier: number;
  finalPriceUf: number;
  appliedCouponId?: string;
  couponExpiresAt?: string;
  enterpriseShareUf: number;
  memberShareUf: number;
  canceledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  petId: string;
  planId: string;
  couponCode?: string;
}

export interface PaymentMethodResponse {
  id: string;
  userId: string;
  provider: string;
  cardBrand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  cardholderName?: string;
  isPrimary: boolean;
  isBackup: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TokenizePaymentMethodRequest {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvv: string;
  cardholderName: string;
  isPrimary: boolean;
  isBackup: boolean;
}

export interface PaymentAttemptResponse {
  id: string;
  subscriptionId: string;
  paymentMethodId?: string;
  amountUf: number;
  amountClp: number;
  ufValueUsed: number;
  status: string;
  provider: string;
  providerTransactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  isRetry: boolean;
  attemptedAt?: string;
  succeededAt?: string;
  failedAt?: string;
  createdAt: string;
}

export interface ProcessPaymentRequest {
  subscriptionId: string;
  paymentMethodId?: string;
  idempotencyKey: string;
}

export interface RetryPaymentRequest {
  paymentAttemptId: string;
  paymentMethodId?: string;
  idempotencyKey: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}
