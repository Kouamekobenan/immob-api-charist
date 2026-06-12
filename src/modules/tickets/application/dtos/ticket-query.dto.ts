import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { TicketStatus, UrgencyLevel } from '@prisma/client';

export class TicketQueryDto {
  @ApiPropertyOptional({ example: 'uuid-du-bien' })
  @IsOptional()
  @IsUUID('4')
  propertyId?: string;

  @ApiPropertyOptional({ example: 'uuid-du-locataire' })
  @IsOptional()
  @IsUUID('4')
  locataireId?: string;

  @ApiPropertyOptional({ example: 'uuid-du-prestataire' })
  @IsOptional()
  @IsUUID('4')
  prestataireId?: string;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  statut?: TicketStatus;

  @ApiPropertyOptional({ enum: UrgencyLevel })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgence?: UrgencyLevel;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
