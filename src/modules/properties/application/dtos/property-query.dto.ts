import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PropertyQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filtrer par bailleur (propriétaire)' })
  @IsOptional()
  @IsUUID('4', { message: 'Identifiant du bailleur invalide' })
  bailleurId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par gérant' })
  @IsOptional()
  @IsUUID('4', { message: 'Identifiant du gérant invalide' })
  gerantId?: string;

  @ApiPropertyOptional({ type: Boolean, description: 'true = occupés uniquement, false = libres uniquement' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'estOccupe doit être un booléen (true ou false)' })
  estOccupe?: boolean;

  @ApiPropertyOptional({ enum: PropertyType, description: 'Filtrer par type de bien' })
  @IsOptional()
  @IsEnum(PropertyType, { message: 'Type de bien invalide' })
  type?: PropertyType;

  @ApiPropertyOptional({ example: 'Abidjan', description: 'Filtrer par ville (exact)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ville?: string;

  @ApiPropertyOptional({
    example: 'duplex',
    description: 'Recherche libre dans le titre, l\'adresse et la description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
