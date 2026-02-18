// Pricing Rule DTOs

export interface PricingRule {
  id: string;
  planId: string;
  species?: string;
  breed?: string;
  ageMin?: number;
  ageMax?: number;
  regionId?: string;
  priceMultiplier: number;
  isSeniorDiscount: boolean;
  isLegacyCustomer: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreatePricingRuleRequest {
  planId: string;
  species?: string;
  breed?: string;
  ageMin?: number;
  ageMax?: number;
  regionId?: string;
  priceMultiplier: number;
  isSeniorDiscount?: boolean;
  isLegacyCustomer?: boolean;
}

export interface UpdatePricingRuleRequest {
  species?: string;
  breed?: string;
  ageMin?: number;
  ageMax?: number;
  regionId?: string;
  priceMultiplier?: number;
  isSeniorDiscount?: boolean;
  isLegacyCustomer?: boolean;
}
