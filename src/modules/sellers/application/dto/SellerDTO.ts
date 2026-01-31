/**
 * Sellers DTOs - /api/v1/sellers
 */

export interface SellerResponse {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  total_referrals: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReferralResponse {
  id: string;
  seller_id: string;
  referred_user_id: string;
  subscription_id?: string;
  created_at: string;
}

export interface GetReferralLinkResponse {
  referral_code: string;
  referral_link: string;
}
