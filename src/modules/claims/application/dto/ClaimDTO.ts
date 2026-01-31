/**
 * Claims DTOs - /api/v1/claims
 */

export interface ClaimItemResponse {
  id: string;
  claim_id: string;
  coverage_type_id: string;
  coverage_type_name?: string;
  description: string;
  amount_clp: number;
  approved_amount_clp?: number;
  invoice_url?: string;
  created_at: string;
}

export interface ClaimResponse {
  id: string;
  pet_id: string;
  subscription_id: string;
  user_id: string;
  claim_number: string;
  status: string;
  vet_name: string;
  vet_clinic?: string;
  veterinary_id?: string;
  attention_date: string;
  diagnosis: string;
  treatment_description?: string;
  total_amount_clp: number;
  approved_amount_clp?: number;
  reimbursed_amount_clp?: number;
  benefit_id?: string;
  bank_account_id?: string;
  comment?: string;
  request_file?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  rejection_reason?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  items?: ClaimItemResponse[];
}

export interface CreateClaimItemRequest {
  coverage_type_id: string;
  description: string;
  amount_clp: number;
  invoice_url?: string;
}

export interface CreateClaimRequest {
  pet_id: string;
  subscription_id: string;
  vet_name: string;
  vet_clinic?: string;
  veterinary_id?: string;
  attention_date: string;
  diagnosis: string;
  treatment_description?: string;
  benefit_id?: string;
  bank_account_id?: string;
  comment?: string;
  request_file?: string;
  items: CreateClaimItemRequest[];
}

export interface ReviewClaimRequest {
  status: 'APPROVED' | 'REJECTED';
  approved_amount_clp?: number;
  admin_notes?: string;
  rejection_reason?: string;
}

export interface PayClaimRequest {
  payment_method: string;
  payment_reference?: string;
}
