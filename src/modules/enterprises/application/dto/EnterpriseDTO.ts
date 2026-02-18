/**
 * Enterprises DTOs - /api/v1/enterprises (admin)
 */

export interface EnterpriseResponse {
  id: string;
  userId: string;
  name: string;
  taxId: string;
  legalName?: string;
  industry?: string;
  billingEmail: string;
  billingAddress?: string;
  billingStateId?: string;
  contactName?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnterpriseRequest {
  userId?: string;
  name: string;
  taxId: string;
  legalName?: string;
  industry?: string;
  billingEmail: string;
  billingAddress?: string;
  billingStateId?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface ContractResponse {
  id: string;
  enterpriseId: string;
  name: string;
  enterpriseSharePercent: number;
  memberSharePercent: number;
  billingDay: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractRequest {
  enterpriseId: string;
  name: string;
  enterpriseSharePercent: number;
  memberSharePercent: number;
  billingDay: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface MembershipResponse {
  id: string;
  enterpriseId: string;
  userId: string;
  contractId: string;
  individualEnterpriseSharePercent?: number;
  individualMemberSharePercent?: number;
  employeeId?: string;
  joinedAt: string;
  leftAt?: string;
}

export interface AddMembershipRequest {
  userId: string;
  contractId: string;
  individualEnterpriseSharePercent?: number;
  individualMemberSharePercent?: number;
  employeeId?: string;
}
