import apiClient, { handleApiError } from './apiClient';

// ==================== TYPES ====================

export interface BankAccountResponse {
  id: string;
  userId: string;
  name?: string;
  dni?: string;
  bankName: string;
  accountType?: 'CHECKING' | 'SAVINGS';
  accountNumber: string;
  accountHolder: string;
  email?: string;
  status: boolean;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountRequest {
  name: string;
  dni?: string;
  bankName: string;
  accountType?: 'CHECKING' | 'SAVINGS';
  accountNumber: string;
  accountHolder: string;
  email?: string;
  isDefault: boolean;
}

export interface UpdateBankAccountRequest {
  name?: string;
  bankName?: string;
  isDefault?: boolean;
}

// ==================== SERVICE ====================

export const bankAccountsService = {
  // Get all bank accounts for current user
  async getBankAccounts(): Promise<BankAccountResponse[]> {
    try {
      const response = await apiClient.get('/bank-accounts');
      return response.data.bankAccounts || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get bank account detail
  async getBankAccount(accountId: string): Promise<BankAccountResponse> {
    try {
      const response = await apiClient.get(`/bank-accounts/${accountId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create bank account
  async createBankAccount(data: CreateBankAccountRequest): Promise<{ accountId: string }> {
    try {
      const response = await apiClient.post('/bank-accounts', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update bank account
  async updateBankAccount(accountId: string, data: UpdateBankAccountRequest): Promise<BankAccountResponse> {
    try {
      const response = await apiClient.put(`/bank-accounts/${accountId}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Set as default bank account
  async setAsDefault(accountId: string): Promise<void> {
    try {
      await apiClient.post(`/bank-accounts/${accountId}/set-default`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete bank account
  async deleteBankAccount(accountId: string): Promise<void> {
    try {
      await apiClient.delete(`/bank-accounts/${accountId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
