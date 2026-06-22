import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, IsUrl } from 'class-validator';

export class AddTrancheDto {
  @ApiProperty({ example: 2000, description: 'Montant de cette tranche (FCFA)' })
  @IsNumber()
  @IsPositive()
  montant: number;

  @ApiPropertyOptional({ example: 'WAVE-2026-06-001', description: 'Référence mobile money' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'URL preuve de paiement (Cloudinary)' })
  @IsOptional()
  @IsUrl()
  recuUrl?: string;

  @ApiPropertyOptional({ example: '2026-06-05T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  datePaiement?: string;
}
