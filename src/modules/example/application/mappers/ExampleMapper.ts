/**
 * Example Mapper
 * 
 * Maps between DTOs and Domain Models
 */

import type { Example } from '../../domain/models/Example';
import type { ExampleDTO, CreateExampleDTO, UpdateExampleDTO } from '../dto/ExampleDTO';

export class ExampleMapper {
  static toDomain(dto: ExampleDTO): Example {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  }

  static toDTO(domain: Example): ExampleDTO {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      created_at: domain.createdAt.toISOString(),
      updated_at: domain.updatedAt.toISOString(),
    };
  }

  static toCreateDTO(data: Omit<Example, 'id' | 'createdAt' | 'updatedAt'>): CreateExampleDTO {
    return {
      name: data.name,
      description: data.description,
    };
  }

  static toUpdateDTO(data: Partial<Example>): UpdateExampleDTO {
    return {
      name: data.name,
      description: data.description,
    };
  }
}
