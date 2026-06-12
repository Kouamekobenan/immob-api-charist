import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class ContractQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Numéro de page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit être un entier' })
  @Min(1, { message: 'La page doit être au minimum 1' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Nombre de résultats par page (max 100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un entier' })
  @Min(1, { message: 'La limite doit être au minimum 1' })
  @Max(100, { message: 'La limite ne peut pas dépasser 100' })
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filtrer par identifiant du locataire' })
  @IsOptional()
  @IsUUID('4', { message: 'Identifiant du locataire invalide' })
  locataireId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par identifiant du bien' })
  @IsOptional()
  @IsUUID('4', { message: 'Identifiant du bien invalide' })
  propertyId?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filtrer par statut actif/inactif (true = actifs uniquement)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'estActif doit être un booléen (true ou false)' })
  estActif?: boolean;
}
