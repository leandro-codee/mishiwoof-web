/**
 * useSellers - me, referral link, referrals
 */

import { useQuery } from '@tanstack/react-query';
import { sellersApi } from '../../infrastructure/repositories/http/SellersHttpRepository';

export const sellersKeys = {
  me: ['sellers', 'me'] as const,
  referralLink: () => ['sellers', 'referral-link'] as const,
  referrals: () => ['sellers', 'referrals'] as const,
};

export function useSellerMe() {
  return useQuery({
    queryKey: sellersKeys.me,
    queryFn: () => sellersApi.getMe(),
  });
}

export function useReferralLink() {
  return useQuery({
    queryKey: sellersKeys.referralLink(),
    queryFn: () => sellersApi.getReferralLink(),
  });
}

export function useReferrals() {
  return useQuery({
    queryKey: sellersKeys.referrals(),
    queryFn: () => sellersApi.listReferrals(),
  });
}
