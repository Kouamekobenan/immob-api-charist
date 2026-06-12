import { Injectable } from '@nestjs/common';
import { Prisma, TicketStatus, UrgencyLevel } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  CreateTicketData,
  ITicketRepository,
  TicketFilters,
  UpdateTicketData,
} from '../../domain/repositories/i-ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';

type PrismaTicket = {
  id: string;
  titre: string;
  description: string;
  photos: string[];
  urgence: UrgencyLevel;
  statut: TicketStatus;
  propertyId: string;
  locataireId: string;
  prestataireId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TicketEntity | null> {
    const t = await this.prisma.ticket.findUnique({ where: { id } });
    return t ? this.toEntity(t) : null;
  }

  async findAll(
    filters: TicketFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<TicketEntity>> {
    const where: Prisma.TicketWhereInput = {
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.locataireId && { locataireId: filters.locataireId }),
      ...(filters.prestataireId && { prestataireId: filters.prestataireId }),
      ...(filters.statut && { statut: filters.statut }),
      ...(filters.urgence && { urgence: filters.urgence }),
    };

    const skip = (pagination.page - 1) * pagination.limit;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: [{ urgence: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets.map((t) => this.toEntity(t)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async create(data: CreateTicketData): Promise<TicketEntity> {
    const t = await this.prisma.ticket.create({
      data: {
        titre: data.titre,
        description: data.description,
        photos: data.photos,
        urgence: data.urgence,
        propertyId: data.propertyId,
        locataireId: data.locataireId,
      },
    });
    return this.toEntity(t);
  }

  async update(id: string, data: UpdateTicketData): Promise<TicketEntity> {
    const t = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...(data.titre !== undefined && { titre: data.titre }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.photos !== undefined && { photos: data.photos }),
        ...(data.urgence !== undefined && { urgence: data.urgence }),
        ...(data.statut !== undefined && { statut: data.statut }),
        ...(data.prestataireId !== undefined && { prestataireId: data.prestataireId }),
      },
    });
    return this.toEntity(t);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ticket.delete({ where: { id } });
  }

  private toEntity(t: PrismaTicket): TicketEntity {
    return new TicketEntity(
      t.id,
      t.titre,
      t.description,
      t.photos,
      t.urgence,
      t.statut,
      t.propertyId,
      t.locataireId,
      t.prestataireId,
      t.createdAt,
      t.updatedAt,
    );
  }
}
