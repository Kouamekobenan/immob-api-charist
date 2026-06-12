import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiPropertyOptional({
    example: 'WAV-2026-XXXXX',
    description: 'Référence de la passerelle de paiement (Wave, Orange Money, Stripe…)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceId?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/recus/recu-juin-2026.pdf',
    description: 'URL de la quittance PDF',
  })
  @IsOptional()
  @IsUrl()
  recuUrl?: string;

  @ApiProperty({
    example: '2026-06-15T00:00:00.000Z',
    description: 'Date effective du paiement',
  })
  @Type(() => Date)
  @IsDate()
  datePaiement: Date;
}
