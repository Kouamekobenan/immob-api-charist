import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateGroupeDto {
  @ApiProperty({ example: 'Charges Résidence Les Palmiers Bât A' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({ example: 'Electricité, eau et entretien parties communes' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5000, description: 'Montant mensuel par locataire (FCFA)' })
  @IsNumber()
  @IsPositive()
  montantParMembre: number;

  @ApiPropertyOptional({ format: 'uuid', description: 'Bien/immeuble concerné (optionnel)' })
  @IsOptional()
  @IsUUID()
  propertyId?: string;
}
