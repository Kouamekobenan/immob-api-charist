import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AuditLogQueryDto {
  @ApiPropertyOptional({ example: 'TICKET_STATUS_UPDATE' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string;

  @ApiPropertyOptional({ example: 'Ticket' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  table?: string;

  @ApiPropertyOptional({ example: 'uuid-enregistrement' })
  @IsOptional()
  @IsUUID('4')
  enregistrementId?: string;

  @ApiPropertyOptional({ example: 'uuid-utilisateur' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Date de début (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateDebut?: Date;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Date de fin (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFin?: Date;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
