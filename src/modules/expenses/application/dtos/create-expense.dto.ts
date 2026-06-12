import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Réparation plomberie cuisine — Juin 2026', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  titre: string;

  @ApiPropertyOptional({ example: 'Remplacement du siphon et du robinet mélangeur.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 45000, description: 'Montant en FCFA' })
  @IsNumber()
  @IsPositive()
  @Max(100_000_000)
  montant: number;

  @ApiProperty({ example: '2026-06-15T00:00:00.000Z', description: 'Date effective de la dépense' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ enum: ExpenseCategory, example: ExpenseCategory.PRESTATAIRE })
  @IsEnum(ExpenseCategory)
  categorie: ExpenseCategory;

  @ApiProperty({ example: 'Diallo Plomberie SARL', description: 'Nom du prestataire/bénéficiaire' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  beneficiaireNom: string;

  @ApiProperty({ example: 'uuid-du-payeur', description: 'ID du gérant ou bailleur qui initie la dépense' })
  @IsUUID('4')
  payeurId: string;

  @ApiPropertyOptional({
    example: 'uuid-prestataire',
    description: 'ID du bénéficiaire s\'il est utilisateur de la plateforme',
  })
  @IsOptional()
  @IsUUID('4')
  beneficiaireId?: string;

  @ApiPropertyOptional({ example: 'uuid-du-bien', description: 'Bien immobilier concerné (optionnel)' })
  @IsOptional()
  @IsUUID('4')
  propertyId?: string;

  @ApiPropertyOptional({
    example: 'uuid-du-ticket',
    description: 'Ticket de maintenance lié à cette dépense (optionnel)',
  })
  @IsOptional()
  @IsUUID('4')
  ticketId?: string;
}
