import { Inject, Injectable } from '@nestjs/common';
import {
  AUDIT_LOG_REPOSITORY,
  AuditLogFilters,
  IAuditLogRepository,
} from '../../domain/repositories/i-audit-log.repository';
import { PaginatedResult } from '../../../contracts/domain/repositories/i-contract.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';
import { AuditLogQueryDto } from '../dtos/audit-log-query.dto';

@Injectable()
export class GetAllAuditLogsUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(query: AuditLogQueryDto): Promise<PaginatedResult<AuditLogEntity>> {
    const filters: AuditLogFilters = {
      action: query.action,
      table: query.table,
      enregistrementId: query.enregistrementId,
      userId: query.userId,
      dateDebut: query.dateDebut,
      dateFin: query.dateFin,
    };
    return this.auditLogRepository.findAll(filters, {
      page: query.page ?? 1,
      limit: query.limit ?? 50,
    });
  }
}
