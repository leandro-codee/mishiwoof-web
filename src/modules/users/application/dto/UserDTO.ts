/**
 * Users DTOs - /api/v1/users, /api/v1/admin/users
 */

export interface UserResponse {
  id: string;
  email: string;
  dni?: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  stateId?: string;
  gender?: string;
  picture?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  stateId?: string;
  gender?: string;
  picture?: string;
}

export interface ListUsersResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  dni?: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  picture?: string;
}

export interface UpdateUserRequest {
  email?: string;
  dni?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  stateId?: string;
  gender?: string;
  picture?: string;
}

// --- Admin: aggregate "user detail" view ---

export interface UserDetailStats {
  petsCount: number;
  activeSubscriptions: number;
  totalPaidCLP: number;
  pendingClaims: number;
}

export interface PetSummary {
  id: string;
  name: string;
  species: string;
  breed?: string;
  birthDate: string;
  gender?: string;
  photoUrl?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface SubscriptionSummary {
  id: string;
  petId: string;
  planId: string;
  status: string;
  billingPeriodStart: string;
  nextBillingDate: string;
  basePriceUF: number;
  finalPriceUF: number;
  paymentProvider: string;
  canceledAt?: string;
  createdAt: string;
}

export interface PaymentMethodSummary {
  id: string;
  provider: string;
  cardBrand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  cardholderName?: string;
  isPrimary: boolean;
  isBackup: boolean;
  status: string;
  createdAt: string;
}

export interface PaymentAttemptSummary {
  id: string;
  subscriptionId: string;
  amountUF: number;
  amountCLP: number;
  status: string;
  provider: string;
  providerTransactionId?: string;
  errorMessage?: string;
  attemptedAt?: string;
  succeededAt?: string;
  failedAt?: string;
  createdAt: string;
}

export interface BankAccountSummary {
  id: string;
  bankName: string;
  accountType?: string;
  accountNumber: string;
  accountHolder?: string;
  isDefault: boolean;
  isVerified: boolean;
  status: boolean;
  createdAt: string;
}

export interface ClaimSummary {
  id: string;
  petId: string;
  claimNumber: string;
  status: string;
  vetName: string;
  attentionDate: string;
  totalAmountCLP: number;
  approvedAmountCLP?: number;
  reimbursedAmountCLP?: number;
  submittedAt: string;
  paidAt?: string;
}

export interface EnterpriseMembershipSummary {
  id: string;
  enterpriseId: string;
  contractId: string;
  employeeId?: string;
  joinedAt: string;
  leftAt?: string;
}

export interface SellerSummary {
  id: string;
  referralCode: string;
  commissionRate: number;
  totalReferrals: number;
  isActive: boolean;
  createdAt: string;
}

export interface CouponRedemptionSummary {
  id: string;
  couponId: string;
  subscriptionId?: string;
  redeemedAt: string;
}

export interface UserDetailResponse {
  user: UserResponse;
  isActive: boolean;
  stats: UserDetailStats;
  pets: PetSummary[];
  subscriptions: SubscriptionSummary[];
  paymentMethods: PaymentMethodSummary[];
  paymentAttempts: PaymentAttemptSummary[];
  bankAccounts: BankAccountSummary[];
  claims: ClaimSummary[];
  enterpriseMemberships: EnterpriseMembershipSummary[];
  seller?: SellerSummary;
  couponRedemptions: CouponRedemptionSummary[];
  notificationsUnread: number;
  chatThreadsCount: number;
}
