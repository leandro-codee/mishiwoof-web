/**
 * Pets DTOs - /api/v1/pets
 */

export interface PetResponse {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  birthDate: string;
  age: number;
  gender?: string;
  color?: string;
  weightKg?: number;
  isSterilized: boolean;
  isSenior: boolean;
  preExistingConditions: string[];
  disease: boolean;
  restricted: boolean;
  minorDisease: boolean;
  tos: boolean;
  photoUrl?: string;
  microchipNumber?: string;
  serial?: string;
  couponId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetRequest {
  name: string;
  species: 'DOG' | 'CAT';
  breed?: string;
  birthDate: string;
  gender?: string;
  color?: string;
  weightKg?: number;
  isSterilized: boolean;
  preExistingConditions?: string[];
  disease: boolean;
  restricted: boolean;
  minorDisease: boolean;
  tos: boolean;
  microchipNumber?: string;
  serial?: string;
  couponId?: string;
}

export interface UpdatePetRequest {
  name?: string;
  breed?: string;
  birthDate?: string;
  gender?: string;
  color?: string;
  weightKg?: number;
  isSterilized?: boolean;
  preExistingConditions?: string[];
  disease?: boolean;
  restricted?: boolean;
  minorDisease?: boolean;
  tos?: boolean;
  microchipNumber?: string;
  serial?: string;
  couponId?: string;
}
