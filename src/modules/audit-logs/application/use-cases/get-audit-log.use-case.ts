import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AUDIT_LOG_REPOSITORY,
  IAuditLogRepository,
} from '../../domain/repositories/i-audit-log.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

@Injectable()
export class GetAuditLogUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(id: string): Promise<AuditLogEntity> {
    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new NotFoundException(`Journal d'audit introuvable (id: ${id})`);
    }
    return log;
  }
}
