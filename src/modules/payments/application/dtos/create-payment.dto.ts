import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  Max,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    example: 150000,
    description: 'Montant du loyer à payer (FCFA)',
  })
  @IsNumber()
  @IsPositive()
  @Max(100_000_000)
  montant: number;

  @ApiProperty({
    example: '06-2026',
    description: 'Période concernée au format MM-YYYY',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}-\d{4}$/, {
    message: 'La période doit être au format MM-YYYY (ex: 06-2026)',
  })
  periode: string;

  @ApiProperty({ example: 'uuid-du-contrat' })
  @IsUUID('4')
  contractId: string;

  @ApiProperty({ example: 'uuid-du-locataire' })
  @IsUUID('4')
  locataireId: string;
}
