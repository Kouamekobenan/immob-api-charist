import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsUpdateEndDateAfterStartDate', async: false })
class IsUpdateEndDateAfterStartDate implements ValidatorConstraintInterface {
  validate(dateFin: string, args: ValidationArguments): boolean {
    const obj = args.object as UpdateContractDto;
    if (!dateFin || !obj.dateDebut) return true;
    return new Date(obj.dateDebut) < new Date(dateFin);
  }

  defaultMessage(): string {
    return 'La date de fin doit être postérieure à la date de début';
  }
}

export class UpdateContractDto {
  @ApiPropertyOptional({
    example: '2026-07-01',
    description: 'Nouvelle date de début du bail',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide (attendu : YYYY-MM-DD)' })
  dateDebut?: string;

  @ApiPropertyOptional({
    example: '2027-06-30',
    description: 'Nouvelle date de fin (null pour supprimer la date de fin)',
    nullable: true,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide (attendu : YYYY-MM-DD)' })
  @Validate(IsUpdateEndDateAfterStartDate)
  dateFin?: string | null;

  @ApiPropertyOptional({
    example: 90000,
    description: 'Nouveau montant total du loyer + charges',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Le loyer total doit être un nombre' })
  @IsPositive({ message: 'Le loyer total doit être positif' })
  loyerTotal?: number;
}
