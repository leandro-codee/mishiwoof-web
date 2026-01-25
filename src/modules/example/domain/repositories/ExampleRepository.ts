/**
 * Example Repository Interface
 * 
 * This is an example of a repository interface following Clean Architecture
 */

import type { Example } from '../models/Example';

export interface ExampleRepository {
  findAll(): Promise<Example[]>;
  findById(id: string): Promise<Example | null>;
  create(data: Omit<Example, 'id' | 'createdAt' | 'updatedAt'>): Promise<Example>;
  update(id: string, data: Partial<Example>): Promise<Example>;
  delete(id: string): Promise<void>;
}
