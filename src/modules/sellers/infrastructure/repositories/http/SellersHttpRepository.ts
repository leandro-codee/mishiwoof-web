/**
 * Sellers HTTP Repository - /api/v1/sellers
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type { SellerResponse, ReferralResponse, GetReferralLinkResponse } from '../../../application/dto/SellerDTO';

const BASE = '/sellers';

export const sellersApi = {
  getMe(): Promise<SellerResponse> {
    return httpClient.get<SellerResponse>(`${BASE}/me`);
  },

  getReferralLink(): Promise<GetReferralLinkResponse> {
    return httpClient.get<GetReferralLinkResponse>(`${BASE}/me/referral-link`);
  },

  listReferrals(): Promise<ReferralResponse[]> {
    return httpClient.get<ReferralResponse[]>(`${BASE}/me/referrals`);
  },
};
