import apiClient, { apiClientUpload, handleApiError } from './apiClient';

// ==================== TYPES ====================

export interface CreateClaimRequest {
  petId: string;
  subscriptionId?: string;
  vetName: string;
  vetClinic?: string;
  attentionDate: string;
  diagnosis: string;
  treatmentDescription?: string;
  totalAmountClp: number;
  benefitId?: string;
  bankAccountId: string;
  comment?: string;
  items: CreateClaimItemRequest[];
}

export interface CreateClaimItemRequest {
  coverageTypeId: string;
  requestedAmountClp: number;
  description: string;
}

export interface ClaimResponse {
  id: string;
  claimNumber: string;
  petId: string;
  petName: string;
  subscriptionId: string;
  userId: string;
  userName: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
  totalAmountClp: number;
  approvedAmountClp?: number;
  submittedAt: string;
  reviewedAt?: string;
  paidAt?: string;
  items: ClaimItemResponse[];
}

export interface ClaimItemResponse {
  id: string;
  coverageTypeId: string;
  coverageTypeName: string;
  requestedAmountClp: number;
  approvedAmountClp?: number;
  rejectionReason?: string;
  description: string;
}

export interface ClaimDetailResponse {
  id: string;
  claimNumber: string;
  status: string;
  totalAmountClp: number;
  approvedAmountClp?: number;
  rejectedAmountClp?: number;
  submittedAt: string;
  reviewedAt?: string;
  paidAt?: string;
  // Beneficiary
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dni?: string;
    phone?: string;
  };
  // Pet
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    birthDate: string;
  };
  // Subscription
  subscription: {
    id: string;
    planName: string;
    status: string;
  };
  // Veterinary
  vetName: string;
  vetClinic?: string;
  attentionDate: string;
  diagnosis: string;
  treatmentDescription?: string;
  // Documents
  requestFormUrl?: string;
  invoices: Array<{
    id: string;
    url: string;
    uploadedAt: string;
  }>;
  // Bank Account
  bankAccount: {
    id: string;
    bankName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  // Items
  items: Array<{
    id: string;
    coverageTypeId: string;
    coverageTypeName: string;
    requestedAmountClp: number;
    approvedAmountClp?: number;
    rejectionReason?: string;
    description: string;
  }>;
  // Audit
  comment?: string;
  adminNotes?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface GetClaimsParams {
  page?: number;
  limit?: number;
  status?: string;
  petId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface GetClaimsResponse {
  claims: ClaimResponse[];
  total: number;
  page: number;
  limit: number;
  stats: {
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    paid: number;
    totalAmountClp: number;
    approvedAmountClp: number;
  };
}

export interface ReviewClaimRequest {
  items: Array<{
    itemId: string;
    approvedAmountClp: number;
  }>;
  adminNotes?: string;
}

export interface RejectClaimRequest {
  reason: string;
  rejectionMessage: string;
  adminNotes?: string;
}

export interface PayClaimRequest {
  paymentMethod: string;
  paymentReference: string;
  reimbursedAmountClp: number;
  paymentDate: string;
  adminNotes?: string;
}

// ==================== SERVICE ====================

export const claimsService = {
  // Create new claim
  async createClaim(data: CreateClaimRequest): Promise<{ claimId: string }> {
    try {
      const response = await apiClient.post('/claims', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upload request form PDF
  async uploadRequestForm(claimId: string, file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClientUpload.post(
        `/claims/${claimId}/request-form`,
        formData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upload invoice
  async uploadInvoice(claimId: string, file: File): Promise<{ invoiceId: string; url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClientUpload.post(
        `/claims/${claimId}/invoices`,
        formData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get claims list
  async getClaims(params: GetClaimsParams = {}): Promise<GetClaimsResponse> {
    try {
      const response = await apiClient.get('/claims', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get claim detail
  async getClaimDetail(claimId: string): Promise<ClaimDetailResponse> {
    try {
      const response = await apiClient.get(`/claims/${claimId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Review and approve claim
  async reviewClaim(claimId: string, data: ReviewClaimRequest): Promise<void> {
    try {
      await apiClient.post(`/claims/${claimId}/review`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Reject claim
  async rejectClaim(claimId: string, data: RejectClaimRequest): Promise<void> {
    try {
      await apiClient.post(`/claims/${claimId}/reject`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin: Pay claim
  async payClaim(claimId: string, data: PayClaimRequest): Promise<void> {
    try {
      await apiClient.post(`/claims/${claimId}/pay`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get claims stats
  async getClaimsStats(): Promise<GetClaimsResponse['stats']> {
    try {
      const response = await apiClient.get('/claims/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
