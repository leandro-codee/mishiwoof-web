/**
 * Enterprises DTOs - /api/v1/enterprises (admin)
 */

export interface EnterpriseResponse {
  id: string;
  user_id: string;
  name: string;
  tax_id: string;
  legal_name?: string;
  industry?: string;
  billing_email: string;
  billing_address?: string;
  billing_commune_id?: string;
  contact_name?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEnterpriseRequest {
  user_id: string;
  name: string;
  tax_id: string;
  legal_name?: string;
  industry?: string;
  billing_email: string;
  billing_address?: string;
  billing_commune_id?: string;
  contact_name?: string;
  contact_phone?: string;
}

export interface ContractResponse {
  id: string;
  enterprise_id: string;
  name: string;
  enterprise_share_percent: number;
  member_share_percent: number;
  billing_day: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContractRequest {
  enterprise_id: string;
  name: string;
  enterprise_share_percent: number;
  member_share_percent: number;
  billing_day: number;
  effective_from: string;
  effective_to?: string;
}

export interface MembershipResponse {
  id: string;
  enterprise_id: string;
  user_id: string;
  contract_id: string;
  individual_enterprise_share_percent?: number;
  individual_member_share_percent?: number;
  employee_id?: string;
  joined_at: string;
  left_at?: string;
}

export interface AddMembershipRequest {
  user_id: string;
  contract_id: string;
  individual_enterprise_share_percent?: number;
  individual_member_share_percent?: number;
  employee_id?: string;
}
