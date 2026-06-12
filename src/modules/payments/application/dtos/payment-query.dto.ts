import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class PaymentQueryDto {
  @ApiPropertyOptional({ example: 'uuid-du-contrat' })
  @IsOptional()
  @IsUUID('4')
  contractId?: string;

  @ApiPropertyOptional({ example: 'uuid-du-locataire' })
  @IsOptional()
  @IsUUID('4')
  locataireId?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  statut?: PaymentStatus;

  @ApiPropertyOptional({ example: '06-2026', description: 'Format MM-YYYY' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{4}$/, { message: 'Format attendu : MM-YYYY (ex: 06-2026)' })
  periode?: string;

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
