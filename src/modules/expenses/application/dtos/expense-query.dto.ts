import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ExpenseCategory, ExpenseStatus } from '@prisma/client';

export class ExpenseQueryDto {
  @ApiPropertyOptional({ example: 'uuid-du-payeur' })
  @IsOptional()
  @IsUUID('4')
  payeurId?: string;

  @ApiPropertyOptional({ example: 'uuid-du-bien' })
  @IsOptional()
  @IsUUID('4')
  propertyId?: string;

  @ApiPropertyOptional({ example: 'uuid-du-beneficiaire' })
  @IsOptional()
  @IsUUID('4')
  beneficiaireId?: string;

  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  categorie?: ExpenseCategory;

  @ApiPropertyOptional({ enum: ExpenseStatus })
  @IsOptional()
  @IsEnum(ExpenseStatus)
  statut?: ExpenseStatus;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateDebut?: Date;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
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

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
