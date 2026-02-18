/**
 * Claims DTOs - /api/v1/claims
 */

export interface ClaimItemResponse {
  id: string;
  claimId: string;
  coverageTypeId: string;
  coverageTypeName?: string;
  description: string;
  amountClp: number;
  approvedAmountClp?: number;
  invoiceUrl?: string;
  createdAt: string;
}

export interface ClaimResponse {
  id: string;
  petId: string;
  subscriptionId: string;
  userId: string;
  claimNumber: string;
  status: string;
  vetName: string;
  vetClinic?: string;
  veterinaryId?: string;
  attentionDate: string;
  diagnosis: string;
  treatmentDescription?: string;
  totalAmountClp: number;
  approvedAmountClp?: number;
  reimbursedAmountClp?: number;
  benefitId?: string;
  bankAccountId?: string;
  comment?: string;
  requestFile?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: ClaimItemResponse[];
}

export interface CreateClaimItemRequest {
  coverageTypeId: string;
  description: string;
  amountClp: number;
  invoiceUrl?: string;
}

export interface CreateClaimRequest {
  petId: string;
  subscriptionId: string;
  vetName: string;
  vetClinic?: string;
  veterinaryId?: string;
  attentionDate: string;
  diagnosis: string;
  treatmentDescription?: string;
  benefitId?: string;
  bankAccountId?: string;
  comment?: string;
  requestFile?: string;
  items: CreateClaimItemRequest[];
}

export interface ReviewClaimRequest {
  status: 'APPROVED' | 'REJECTED';
  approvedAmountClp?: number;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface PayClaimRequest {
  paymentMethod: string;
  paymentReference?: string;
}
