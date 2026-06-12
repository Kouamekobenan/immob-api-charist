import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  ContractFilters,
  CreateContractData,
  IContractRepository,
  PaginatedResult,
  PaginationOptions,
  UpdateContractData,
} from '../../domain/repositories/i-contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';

type PrismaContract = {
  id: string;
  dateDebut: Date;
  dateFin: Date | null;
  loyerTotal: number;
  estActif: boolean;
  propertyId: string;
  locataireId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaContractRepository implements IContractRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ContractEntity | null> {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    return contract ? this.toEntity(contract) : null;
  }

  async findAll(
    filters: ContractFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<ContractEntity>> {
    const where: Prisma.ContractWhereInput = {
      ...(filters.locataireId && { locataireId: filters.locataireId }),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.estActif !== undefined && { estActif: filters.estActif }),
    };

    const skip = (pagination.page - 1) * pagination.limit;

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return {
      data: contracts.map((c) => this.toEntity(c)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findActiveByPropertyId(propertyId: string): Promise<ContractEntity | null> {
    const contract = await this.prisma.contract.findFirst({
      where: { propertyId, estActif: true },
    });
    return contract ? this.toEntity(contract) : null;
  }

  async findByLocataireId(locataireId: string): Promise<ContractEntity[]> {
    const contracts = await this.prisma.contract.findMany({
      where: { locataireId },
      orderBy: { createdAt: 'desc' },
    });
    return contracts.map((c) => this.toEntity(c));
  }

  async create(data: CreateContractData): Promise<ContractEntity> {
    const contract = await this.prisma.contract.create({
      data: {
        dateDebut: data.dateDebut,
        dateFin: data.dateFin ?? null,
        loyerTotal: data.loyerTotal,
        propertyId: data.propertyId,
        locataireId: data.locataireId,
      },
    });
    return this.toEntity(contract);
  }

  async update(id: string, data: UpdateContractData): Promise<ContractEntity> {
    const contract = await this.prisma.contract.update({
      where: { id },
      data: {
        ...(data.dateDebut !== undefined && { dateDebut: data.dateDebut }),
        ...(data.dateFin !== undefined && { dateFin: data.dateFin }),
        ...(data.loyerTotal !== undefined && { loyerTotal: data.loyerTotal }),
      },
    });
    return this.toEntity(contract);
  }

  async terminate(id: string, dateFin: Date): Promise<ContractEntity> {
    const contract = await this.prisma.contract.update({
      where: { id },
      data: { estActif: false, dateFin },
    });
    return this.toEntity(contract);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contract.delete({ where: { id } });
  }

  async setPropertyOccupied(propertyId: string, occupied: boolean): Promise<void> {
    await this.prisma.property.update({
      where: { id: propertyId },
      data: { estOccupe: occupied },
    });
  }

  private toEntity(contract: PrismaContract): ContractEntity {
    return new ContractEntity(
      contract.id,
      contract.dateDebut,
      contract.dateFin,
      contract.loyerTotal,
      contract.estActif,
      contract.propertyId,
      contract.locataireId,
      contract.createdAt,
      contract.updatedAt,
    );
  }
}
