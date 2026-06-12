import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsEndDateAfterStartDate', async: false })
class IsEndDateAfterStartDate implements ValidatorConstraintInterface {
  validate(dateFin: string, args: ValidationArguments): boolean {
    const obj = args.object as CreateContractDto;
    if (!dateFin || !obj.dateDebut) return true;
    return new Date(obj.dateDebut) < new Date(dateFin);
  }

  defaultMessage(): string {
    return 'La date de fin ($value) doit être postérieure à la date de début';
  }
}

export class CreateContractDto {
  @ApiProperty({
    example: '2026-07-01',
    description: 'Date de début du bail (ISO 8601)',
  })
  @IsNotEmpty({ message: 'La date de début est requise' })
  @IsDateString({}, { message: 'Format de date invalide (attendu : YYYY-MM-DD)' })
  dateDebut: string;

  @ApiPropertyOptional({
    example: '2027-06-30',
    description: 'Date de fin du bail (optionnel pour un bail à durée indéterminée)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide (attendu : YYYY-MM-DD)' })
  @Validate(IsEndDateAfterStartDate)
  dateFin?: string;

  @ApiProperty({
    example: 85000,
    description: 'Montant total du loyer + charges au moment de la signature',
  })
  @IsNotEmpty({ message: 'Le loyer total est requis' })
  @IsNumber({}, { message: 'Le loyer total doit être un nombre' })
  @IsPositive({ message: 'Le loyer total doit être positif' })
  loyerTotal: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identifiant du bien immobilier',
  })
  @IsNotEmpty({ message: 'L\'identifiant du bien est requis' })
  @IsUUID('4', { message: 'Identifiant du bien invalide' })
  propertyId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Identifiant du locataire',
  })
  @IsNotEmpty({ message: 'L\'identifiant du locataire est requis' })
  @IsUUID('4', { message: 'Identifiant du locataire invalide' })
  locataireId: string;
}
