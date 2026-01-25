/**
 * Example DTO
 * 
 * Data Transfer Object for Example entity
 */

export interface ExampleDTO {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExampleDTO {
  name: string;
  description?: string;
}

export interface UpdateExampleDTO {
  name?: string;
  description?: string;
}
