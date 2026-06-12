import { Inject, Injectable } from '@nestjs/common';
import {
  AUDIT_LOG_REPOSITORY,
  CreateAuditLogData,
  IAuditLogRepository,
} from '../../domain/repositories/i-audit-log.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

@Injectable()
export class CreateAuditLogUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(data: CreateAuditLogData): Promise<AuditLogEntity> {
    return this.auditLogRepository.create(data);
  }
}
