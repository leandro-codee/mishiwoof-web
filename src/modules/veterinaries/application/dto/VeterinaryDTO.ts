// Veterinary DTOs

export interface Veterinary {
  id: string;
  name: string;
  dni?: string;
  institutionDni?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateVeterinaryRequest {
  name: string;
  dni?: string;
  institutionDni?: string;
}

export interface UpdateVeterinaryRequest {
  name?: string;
  dni?: string;
  institutionDni?: string;
}
