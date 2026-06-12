import { PropertyType } from '@prisma/client';
import { PropertyEntity } from '../entities/property.entity';
import { PaginatedResult, PaginationOptions } from '../../../contracts/domain/repositories/i-contract.repository';

export interface CreatePropertyData {
  titre: string;
  description?: string;
  adresse: string;
  ville: string;
  type?: PropertyType;
  loyerDeBase: number;
  charges?: number;
  bailleurId: string;
  gerantId?: string;
}

export interface UpdatePropertyData {
  titre?: string;
  description?: string | null;
  adresse?: string;
  ville?: string;
  type?: PropertyType;
  loyerDeBase?: number;
  charges?: number;
  gerantId?: string | null;
}

export interface PropertyFilters {
  bailleurId?: string;
  gerantId?: string;
  estOccupe?: boolean;
  type?: PropertyType;
  ville?: string;
  search?: string;
}

export interface IPropertyRepository {
  findById(id: string): Promise<PropertyEntity | null>;
  findAll(
    filters: PropertyFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<PropertyEntity>>;
  create(data: CreatePropertyData): Promise<PropertyEntity>;
  update(id: string, data: UpdatePropertyData): Promise<PropertyEntity>;
  delete(id: string): Promise<void>;
  hasActiveContracts(propertyId: string): Promise<boolean>;
}

export const PROPERTY_REPOSITORY = Symbol('PROPERTY_REPOSITORY');
