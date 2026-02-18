import apiClient, { apiClientUpload, handleApiError } from './apiClient';

// ==================== TYPES ====================

export interface CreatePetRequest {
  name: string;
  species: 'DOG' | 'CAT';
  breed?: string;
  birthDate: string;
  gender?: 'MALE' | 'FEMALE';
  color?: string;
  weightKg?: number;
  isSterilized: boolean;
  preExistingConditions: string[];
  disease: boolean;
  restricted: boolean;
  minorDisease: boolean;
  tos: boolean;
  microchipNumber?: string;
  serial?: string;
  couponCode?: string;
}

export interface UpdatePetRequest {
  name?: string;
  breed?: string;
  color?: string;
  weightKg?: number;
  isSterilized?: boolean;
  preExistingConditions?: string[];
  disease?: boolean;
  restricted?: boolean;
  minorDisease?: boolean;
  microchipNumber?: string;
  serial?: string;
}

export interface PetResponse {
  id: string;
  ownerId: string;
  name: string;
  species: 'DOG' | 'CAT';
  breed?: string;
  birthDate: string;
  age: number;
  gender?: 'MALE' | 'FEMALE';
  color?: string;
  weightKg?: number;
  photoUrl?: string;
  isSterilized: boolean;
  isSenior: boolean;
  preExistingConditions: string[];
  disease: boolean;
  restricted: boolean;
  minorDisease: boolean;
  tos: boolean;
  microchipNumber?: string;
  serial?: string;
  appliedCoupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PetWithSubscription extends PetResponse {
  subscription?: {
    id: string;
    planId: string;
    planName: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
    billingPeriodStart: string;
    nextBillingDate: string;
    finalPriceUf: number;
  };
}

export interface SubscribePetRequest {
  petId: string;
  planId: string;
  couponCode?: string;
}

export interface ChangePlanRequest {
  newPlanId: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}

// ==================== SERVICE ====================

export const petsService = {
  // Create new pet
  async createPet(data: CreatePetRequest): Promise<{ petId: string; pet: PetResponse }> {
    try {
      const response = await apiClient.post('/pets', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all pets for current user
  async getPets(): Promise<PetWithSubscription[]> {
    try {
      const response = await apiClient.get('/pets');
      return response.data.pets || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get pet detail
  async getPet(petId: string): Promise<PetWithSubscription> {
    try {
      const response = await apiClient.get(`/pets/${petId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update pet
  async updatePet(petId: string, data: UpdatePetRequest): Promise<PetResponse> {
    try {
      const response = await apiClient.put(`/pets/${petId}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upload pet photo
  async uploadPetPhoto(petId: string, file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await apiClientUpload.post(
        `/pets/${petId}/photo`,
        formData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Subscribe pet to a plan
  async subscribePet(data: SubscribePetRequest): Promise<{ subscriptionId: string }> {
    try {
      const response = await apiClient.post(`/pets/${data.petId}/subscribe`, {
        planId: data.planId,
        couponCode: data.couponCode,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Change pet plan
  async changePlan(petId: string, data: ChangePlanRequest): Promise<void> {
    try {
      await apiClient.post(`/pets/${petId}/change-plan`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cancel subscription
  async cancelSubscription(petId: string, data: CancelSubscriptionRequest): Promise<void> {
    try {
      await apiClient.post(`/pets/${petId}/cancel-subscription`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete pet
  async deletePet(petId: string): Promise<void> {
    try {
      await apiClient.delete(`/pets/${petId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
