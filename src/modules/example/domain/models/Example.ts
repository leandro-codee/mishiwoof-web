/**
 * Example Domain Model
 * 
 * This is an example of a domain model following Clean Architecture
 */

export interface Example {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
