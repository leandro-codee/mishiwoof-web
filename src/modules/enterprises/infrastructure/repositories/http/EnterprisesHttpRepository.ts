/**
 * Enterprises HTTP Repository - /api/v1/enterprises
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type {
  EnterpriseResponse,
  CreateEnterpriseRequest,
  ContractResponse,
  CreateContractRequest,
  MembershipResponse,
  AddMembershipRequest,
} from '../../../application/dto/EnterpriseDTO';

const BASE = '/enterprises';

export const enterprisesApi = {
  list(): Promise<EnterpriseResponse[]> {
    return httpClient.get<EnterpriseResponse[]>(BASE);
  },

  get(id: string): Promise<EnterpriseResponse> {
    return httpClient.get<EnterpriseResponse>(`${BASE}/${id}`);
  },

  create(body: CreateEnterpriseRequest): Promise<EnterpriseResponse> {
    return httpClient.post<EnterpriseResponse>(BASE, body);
  },

  createContract(enterpriseId: string, body: CreateContractRequest): Promise<ContractResponse> {
    return httpClient.post<ContractResponse>(`${BASE}/${enterpriseId}/contracts`, body);
  },

  addMembership(enterpriseId: string, body: AddMembershipRequest): Promise<MembershipResponse> {
    return httpClient.post<MembershipResponse>(`${BASE}/${enterpriseId}/memberships`, body);
  },

  listMemberships(enterpriseId: string): Promise<MembershipResponse[]> {
    return httpClient.get<MembershipResponse[]>(`${BASE}/${enterpriseId}/memberships`);
  },

  removeMembership(membershipId: string): Promise<void> {
    return httpClient.delete(`${BASE}/memberships/${membershipId}`);
  },
};
