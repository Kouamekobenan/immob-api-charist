import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

export class AuditLogResponse {
  @ApiProperty() id: string;
  @ApiProperty() action: string;
  @ApiProperty() table: string;
  @ApiProperty() enregistrementId: string;
  @ApiProperty({ type: Object }) details: Record<string, unknown>;
  @ApiPropertyOptional({ nullable: true }) ipAdresse: string | null;
  @ApiPropertyOptional({ nullable: true }) userAgent: string | null;
  @ApiPropertyOptional({ nullable: true }) userId: string | null;
  @ApiProperty() createdAt: Date;

  static fromEntity(entity: AuditLogEntity): AuditLogResponse {
    const res = new AuditLogResponse();
    res.id = entity.id;
    res.action = entity.action;
    res.table = entity.table;
    res.enregistrementId = entity.enregistrementId;
    res.details = entity.details;
    res.ipAdresse = entity.ipAdresse;
    res.userAgent = entity.userAgent;
    res.userId = entity.userId;
    res.createdAt = entity.createdAt;
    return res;
  }
}

export class PaginatedAuditLogsResponse {
  @ApiProperty({ type: [AuditLogResponse] }) data: AuditLogResponse[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}
