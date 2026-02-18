// Bank Account DTOs

export interface BankAccount {
  id: string;
  userId: string;
  name?: string;
  dni?: string;
  bankName: string;
  accountType?: string;
  accountNumber: string;
  accountHolder: string;
  email?: string;
  status: boolean;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateBankAccountRequest {
  name?: string;
  dni?: string;
  bankName: string;
  accountType?: string;
  accountNumber: string;
  accountHolder: string;
  email?: string;
  isDefault?: boolean;
}

export interface UpdateBankAccountRequest {
  name?: string;
  dni?: string;
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  accountHolder?: string;
  email?: string;
  status?: boolean;
  isDefault?: boolean;
  isVerified?: boolean;
}
