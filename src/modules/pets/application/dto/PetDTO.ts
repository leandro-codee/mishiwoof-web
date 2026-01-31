/**
 * Pets DTOs - /api/v1/pets
 */

export interface PetResponse {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed?: string;
  birth_date: string;
  age: number;
  gender?: string;
  color?: string;
  weight_kg?: number;
  is_sterilized: boolean;
  is_senior: boolean;
  pre_existing_conditions: string[];
  disease: boolean;
  restricted: boolean;
  minor_disease: boolean;
  tos: boolean;
  photo_url?: string;
  microchip_number?: string;
  serial?: string;
  coupon_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePetRequest {
  name: string;
  species: 'DOG' | 'CAT';
  breed?: string;
  birth_date: string;
  gender?: string;
  color?: string;
  weight_kg?: number;
  is_sterilized: boolean;
  pre_existing_conditions?: string[];
  disease: boolean;
  restricted: boolean;
  minor_disease: boolean;
  tos: boolean;
  microchip_number?: string;
  serial?: string;
  coupon_id?: string;
}

export interface UpdatePetRequest {
  name?: string;
  breed?: string;
  birth_date?: string;
  gender?: string;
  color?: string;
  weight_kg?: number;
  is_sterilized?: boolean;
  pre_existing_conditions?: string[];
  disease?: boolean;
  restricted?: boolean;
  minor_disease?: boolean;
  tos?: boolean;
  microchip_number?: string;
  serial?: string;
  coupon_id?: string;
}
