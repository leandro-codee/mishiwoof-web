/**
 * Example HTTP Repository
 * 
 * HTTP implementation of ExampleRepository
 */

import { httpClient } from '@shared/infrastructure/http/base.client';
import type { ExampleRepository } from '../../../domain/repositories/ExampleRepository';
import type { Example } from '../../../domain/models/Example';
import type { ExampleDTO } from '../../../application/dto/ExampleDTO';
import { ExampleMapper } from '../../../application/mappers/ExampleMapper';

export class ExampleHttpRepository implements ExampleRepository {
  private baseUrl = '/api/examples';

  async findAll(): Promise<Example[]> {
    const dtos = await httpClient.get<ExampleDTO[]>(this.baseUrl);
    return dtos.map(dto => ExampleMapper.toDomain(dto));
  }

  async findById(id: string): Promise<Example | null> {
    try {
      const dto = await httpClient.get<ExampleDTO>(`${this.baseUrl}/${id}`);
      return ExampleMapper.toDomain(dto);
    } catch (error) {
      return null;
    }
  }

  async create(data: Omit<Example, 'id' | 'createdAt' | 'updatedAt'>): Promise<Example> {
    const createDTO = ExampleMapper.toCreateDTO(data);
    const dto = await httpClient.post<ExampleDTO>(this.baseUrl, createDTO);
    return ExampleMapper.toDomain(dto);
  }

  async update(id: string, data: Partial<Example>): Promise<Example> {
    const updateDTO = ExampleMapper.toUpdateDTO(data);
    const dto = await httpClient.put<ExampleDTO>(`${this.baseUrl}/${id}`, updateDTO);
    return ExampleMapper.toDomain(dto);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const exampleHttpRepository = new ExampleHttpRepository();
