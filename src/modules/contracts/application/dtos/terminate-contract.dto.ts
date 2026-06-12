import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class TerminateContractDto {
  @ApiPropertyOptional({
    example: '2026-08-31',
    description: 'Date de résiliation (par défaut : aujourd\'hui)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide (attendu : YYYY-MM-DD)' })
  dateFin?: string;
}
