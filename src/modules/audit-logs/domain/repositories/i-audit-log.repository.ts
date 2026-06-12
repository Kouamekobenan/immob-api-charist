import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';
import { AuditLogEntity } from '../entities/audit-log.entity';

export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');

export interface CreateAuditLogData {
  action: string;
  table: string;
  enregistrementId: string;
  details: Record<string, unknown>;
  ipAdresse?: string;
  userAgent?: string;
  userId?: string;
}

export interface AuditLogFilters {
  action?: string;
  table?: string;
  enregistrementId?: string;
  userId?: string;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface IAuditLogRepository {
  findById(id: string): Promise<AuditLogEntity | null>;
  findAll(
    filters: AuditLogFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<AuditLogEntity>>;
  create(data: CreateAuditLogData): Promise<AuditLogEntity>;
}
