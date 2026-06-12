import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdatePropertyDto {
  @ApiPropertyOptional({ example: 'Studio Lumineux — Plateau', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Le titre doit contenir au moins 5 caractères' })
  @MaxLength(150)
  titre?: string;

  @ApiPropertyOptional({
    example: 'Studio rénové, cuisine équipée, proche transport.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({ example: '45 Avenue Chardy, Plateau' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  adresse?: string;

  @ApiPropertyOptional({ example: 'Abidjan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ville?: string;

  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType, { message: 'Type de bien invalide' })
  type?: PropertyType;

  @ApiPropertyOptional({
    example: 160000,
    description: 'Nouveau loyer de base (en FCFA)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Le loyer de base doit être un nombre' })
  @IsPositive({ message: 'Le loyer de base doit être positif' })
  loyerDeBase?: number;

  @ApiPropertyOptional({
    example: 20000,
    description: 'Nouvelles charges mensuelles (en FCFA)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Les charges doivent être un nombre' })
  @Min(0, { message: 'Les charges ne peuvent pas être négatives' })
  @Max(10000000)
  charges?: number;
}
