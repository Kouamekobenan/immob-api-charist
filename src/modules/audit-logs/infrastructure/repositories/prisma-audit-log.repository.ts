import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  AuditLogFilters,
  CreateAuditLogData,
  IAuditLogRepository,
} from '../../domain/repositories/i-audit-log.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';

type PrismaAuditLog = {
  id: string;
  action: string;
  table: string;
  enregistrementId: string;
  details: Prisma.JsonValue;
  ipAdresse: string | null;
  userAgent: string | null;
  userId: string | null;
  createdAt: Date;
};

@Injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AuditLogEntity | null> {
    const log = await this.prisma.auditLog.findUnique({ where: { id } });
    return log ? this.toEntity(log) : null;
  }

  async findAll(
    filters: AuditLogFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<AuditLogEntity>> {
    const where: Prisma.AuditLogWhereInput = {
      ...(filters.action && {
        action: { contains: filters.action, mode: 'insensitive' },
      }),
      ...(filters.table && { table: filters.table }),
      ...(filters.enregistrementId && { enregistrementId: filters.enregistrementId }),
      ...(filters.userId && { userId: filters.userId }),
      ...((filters.dateDebut || filters.dateFin) && {
        createdAt: {
          ...(filters.dateDebut && { gte: filters.dateDebut }),
          ...(filters.dateFin && { lte: filters.dateFin }),
        },
      }),
    };

    const skip = (pagination.page - 1) * pagination.limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((l) => this.toEntity(l)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async create(data: CreateAuditLogData): Promise<AuditLogEntity> {
    const log = await this.prisma.auditLog.create({
      data: {
        action: data.action,
        table: data.table,
        enregistrementId: data.enregistrementId,
        details: data.details as Prisma.InputJsonValue,
        ipAdresse: data.ipAdresse ?? null,
        userAgent: data.userAgent ?? null,
        userId: data.userId ?? null,
      },
    });
    return this.toEntity(log);
  }

  private toEntity(log: PrismaAuditLog): AuditLogEntity {
    return new AuditLogEntity(
      log.id,
      log.action,
      log.table,
      log.enregistrementId,
      log.details as Record<string, unknown>,
      log.ipAdresse,
      log.userAgent,
      log.userId,
      log.createdAt,
    );
  }
}
