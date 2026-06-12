import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class PayExpenseDto {
  @ApiPropertyOptional({
    example: 'VIR-2026-06-XXXX',
    description: 'Référence du virement / chèque / mobile money',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceId?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/factures/facture-plomberie.pdf',
    description: 'URL du justificatif uploadé (facture, reçu)',
  })
  @IsOptional()
  @IsUrl()
  justificatifUrl?: string;
}
