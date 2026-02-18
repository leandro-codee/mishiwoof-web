import apiClient, { handleApiError } from './apiClient';

// ==================== TYPES ====================

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  stateId?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  referredCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  stateId?: string;
  stateName?: string;
  gender?: string;
  emailVerified: boolean;
  createdAt: string;
}

// ==================== SERVICE ====================

export const authService = {
  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', data);
      
      // Store tokens
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Login
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', data);
      
      // Store tokens
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update profile
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', { token });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Resend verification email
  async resendVerification(): Promise<void> {
    try {
      await apiClient.post('/auth/resend-verification');
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
