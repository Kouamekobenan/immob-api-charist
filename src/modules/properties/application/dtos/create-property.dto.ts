import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Villa Duplex Chic — Cocody',
    description: 'Titre descriptif du bien',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'Le titre est requis' })
  @IsString()
  @MinLength(5, { message: 'Le titre doit contenir au moins 5 caractères' })
  @MaxLength(150, { message: 'Le titre ne peut pas dépasser 150 caractères' })
  titre: string;

  @ApiPropertyOptional({
    example: 'Beau duplex avec terrasse, 3 chambres, parking sécurisé.',
    description: 'Description détaillée du bien',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'La description ne peut pas dépasser 2000 caractères' })
  description?: string;

  @ApiProperty({
    example: '12 Rue des Jacarandas, Cocody',
    description: 'Adresse complète du bien',
  })
  @IsNotEmpty({ message: 'L\'adresse est requise' })
  @IsString()
  @MaxLength(255)
  adresse: string;

  @ApiProperty({ example: 'Abidjan' })
  @IsNotEmpty({ message: 'La ville est requise' })
  @IsString()
  @MaxLength(100)
  ville: string;

  @ApiPropertyOptional({
    enum: PropertyType,
    default: PropertyType.APPARTEMENT,
    description: 'Type de bien immobilier',
  })
  @IsOptional()
  @IsEnum(PropertyType, { message: 'Type de bien invalide' })
  type?: PropertyType;

  @ApiProperty({
    example: 150000,
    description: 'Loyer de base hors charges (en FCFA)',
  })
  @IsNotEmpty({ message: 'Le loyer de base est requis' })
  @IsNumber({}, { message: 'Le loyer de base doit être un nombre' })
  @IsPositive({ message: 'Le loyer de base doit être positif' })
  loyerDeBase: number;

  @ApiPropertyOptional({
    example: 25000,
    description: 'Charges mensuelles (en FCFA), 0 par défaut',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Les charges doivent être un nombre' })
  @Min(0, { message: 'Les charges ne peuvent pas être négatives' })
  @Max(10000000)
  charges?: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identifiant du bailleur (propriétaire)',
  })
  @IsNotEmpty({ message: 'L\'identifiant du bailleur est requis' })
  @IsUUID('4', { message: 'Identifiant du bailleur invalide' })
  bailleurId: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Identifiant du gérant (optionnel)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Identifiant du gérant invalide' })
  gerantId?: string;
}
