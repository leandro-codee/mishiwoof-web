/**
 * Billing DTOs - /api/v1/billing (payment methods, subscriptions, payments)
 */

export type BillingPaymentProvider = 'MERCADOPAGO' | 'TRANSBANK' | 'MOCK';

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
  paymentProvider: string
  providerSubscriptionId?: string
  initPointUrl?: string    // nuevo — URL de checkout MP
  canceledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

/** `petId` debe ser de una mascota del usuario autenticado (misma sesión que el JWT). */
export interface CreateSubscriptionRequest {
  petId: string
  planId: string
  couponCode?: string
  paymentProvider: BillingPaymentProvider
  payerEmail?: string
  cardToken?: string
}

/** Una línea = una suscripción; N líneas en `items` = mismo POST /subscriptions que el unitario. */
export interface SubscriptionBatchItem {
  petId: string
  planId: string
}

/** Cada `petId` debe ser de una mascota del usuario autenticado (misma sesión que el JWT). */
export interface CreateSubscriptionBatchRequest {
  items: SubscriptionBatchItem[]
  couponCode?: string
  paymentProvider: BillingPaymentProvider
}

export interface SubscriptionBatchResponse {
  /** Id del lote (= suele coincidir con subscriptions[0].id); pago: POST .../subscriptions/batch/:id/pay */
  id: string
  subscriptionIds: string[]
  subscriptions?: SubscriptionResponse[]
  totalUf?: number
  totalClp?: number
}

export interface PaymentMethodResponse {
  id: string;
  userId: string;
  provider: string;
  lastFour: string;
  /** card_id de Mercado Pago u otro proveedor — necesario para tokenizar CVV en cobros posteriores */
  providerPaymentMethodId?: string;
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
  cardToken: string        // antes tenía cardNumber, cvv, etc.
  cardholderName: string
  payerEmail: string       // nuevo
  isPrimary: boolean
  isBackup: boolean
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
  /** Token generado en el browser (MP Bricks / fields + CVV o brick de tarjeta completa) */
  cardToken: string;
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
