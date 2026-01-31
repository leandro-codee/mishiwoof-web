/**
 * Billing DTOs - /api/v1/billing (payment methods, subscriptions, payments)
 */

export interface SubscriptionResponse {
  id: string;
  pet_id: string;
  plan_id: string;
  plan_name?: string;
  enterprise_membership_id?: string;
  status: string;
  billing_period_start: string;
  next_billing_date: string;
  base_price_uf: number;
  applied_multiplier: number;
  final_price_uf: number;
  applied_coupon_id?: string;
  coupon_expires_at?: string;
  enterprise_share_uf: number;
  member_share_uf: number;
  canceled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionRequest {
  pet_id: string;
  plan_id: string;
  coupon_code?: string;
}

export interface PaymentMethodResponse {
  id: string;
  user_id: string;
  provider: string;
  card_brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  cardholder_name?: string;
  is_primary: boolean;
  is_backup: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TokenizePaymentMethodRequest {
  card_number: string;
  exp_month: number;
  exp_year: number;
  cvv: string;
  cardholder_name: string;
  is_primary: boolean;
  is_backup: boolean;
}

export interface PaymentAttemptResponse {
  id: string;
  subscription_id: string;
  payment_method_id?: string;
  amount_uf: number;
  amount_clp: number;
  uf_value_used: number;
  status: string;
  provider: string;
  provider_transaction_id?: string;
  error_code?: string;
  error_message?: string;
  retry_count: number;
  is_retry: boolean;
  attempted_at?: string;
  succeeded_at?: string;
  failed_at?: string;
  created_at: string;
}

export interface ProcessPaymentRequest {
  subscription_id: string;
  payment_method_id?: string;
  idempotency_key: string;
}

export interface RetryPaymentRequest {
  payment_attempt_id: string;
  payment_method_id?: string;
  idempotency_key: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}
