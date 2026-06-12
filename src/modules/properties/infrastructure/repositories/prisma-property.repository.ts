import { Injectable } from '@nestjs/common';
import { Prisma, PropertyType } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  CreatePropertyData,
  IPropertyRepository,
  PropertyFilters,
  UpdatePropertyData,
} from '../../domain/repositories/i-property.repository';
import { PropertyEntity } from '../../domain/entities/property.entity';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';

type PrismaProperty = {
  id: string;
  titre: string;
  description: string | null;
  adresse: string;
  ville: string;
  type: PropertyType;
  loyerDeBase: number;
  charges: number;
  estOccupe: boolean;
  bailleurId: string;
  gerantId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaPropertyRepository implements IPropertyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PropertyEntity | null> {
    const p = await this.prisma.property.findUnique({ where: { id } });
    return p ? this.toEntity(p) : null;
  }

  async findAll(
    filters: PropertyFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<PropertyEntity>> {
    const where: Prisma.PropertyWhereInput = {
      ...(filters.bailleurId && { bailleurId: filters.bailleurId }),
      ...(filters.gerantId && { gerantId: filters.gerantId }),
      ...(filters.estOccupe !== undefined && { estOccupe: filters.estOccupe }),
      ...(filters.type && { type: filters.type }),
      ...(filters.ville && { ville: { equals: filters.ville, mode: 'insensitive' } }),
      ...(filters.search && {
        OR: [
          { titre: { contains: filters.search, mode: 'insensitive' } },
          { adresse: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const skip = (pagination.page - 1) * pagination.limit;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties.map((p) => this.toEntity(p)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async create(data: CreatePropertyData): Promise<PropertyEntity> {
    const p = await this.prisma.property.create({
      data: {
        titre: data.titre,
        description: data.description ?? null,
        adresse: data.adresse,
        ville: data.ville,
        type: data.type,
        loyerDeBase: data.loyerDeBase,
        charges: data.charges ?? 0,
        bailleurId: data.bailleurId,
        gerantId: data.gerantId ?? null,
      },
    });
    return this.toEntity(p);
  }

  async update(id: string, data: UpdatePropertyData): Promise<PropertyEntity> {
    const p = await this.prisma.property.update({
      where: { id },
      data: {
        ...(data.titre !== undefined && { titre: data.titre }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.adresse !== undefined && { adresse: data.adresse }),
        ...(data.ville !== undefined && { ville: data.ville }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.loyerDeBase !== undefined && { loyerDeBase: data.loyerDeBase }),
        ...(data.charges !== undefined && { charges: data.charges }),
        ...(data.gerantId !== undefined && { gerantId: data.gerantId }),
      },
    });
    return this.toEntity(p);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.property.delete({ where: { id } });
  }

  async hasActiveContracts(propertyId: string): Promise<boolean> {
    const count = await this.prisma.contract.count({
      where: { propertyId, estActif: true },
    });
    return count > 0;
  }

  private toEntity(p: PrismaProperty): PropertyEntity {
    return new PropertyEntity(
      p.id,
      p.titre,
      p.description,
      p.adresse,
      p.ville,
      p.type,
      p.loyerDeBase,
      p.charges,
      p.estOccupe,
      p.bailleurId,
      p.gerantId,
      p.createdAt,
      p.updatedAt,
    );
  }
}
