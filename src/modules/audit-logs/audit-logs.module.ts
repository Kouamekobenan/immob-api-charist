import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { AUDIT_LOG_REPOSITORY } from './domain/repositories/i-audit-log.repository';
import { PrismaAuditLogRepository } from './infrastructure/repositories/prisma-audit-log.repository';

import { CreateAuditLogUseCase } from './application/use-cases/create-audit-log.use-case';
import { GetAuditLogUseCase } from './application/use-cases/get-audit-log.use-case';
import { GetAllAuditLogsUseCase } from './application/use-cases/get-all-audit-logs.use-case';

import { AuditLogsController } from './presentation/audit-logs.controller';

const useCases = [
  CreateAuditLogUseCase,
  GetAuditLogUseCase,
  GetAllAuditLogsUseCase,
];

@Module({
  imports: [AuthModule],
  controllers: [AuditLogsController],
  providers: [
    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: PrismaAuditLogRepository,
    },
    ...useCases,
  ],
  // CreateAuditLogUseCase exporté pour que les autres modules puissent tracer leurs actions
  exports: [CreateAuditLogUseCase],
})
export class AuditLogsModule {}
