import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class ConfirmContributionDto {
  @ApiPropertyOptional({ example: 'WAVE-2026-06-123456', description: 'Référence mobile money' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'URL preuve de paiement (Cloudinary)' })
  @IsOptional()
  @IsUrl()
  recuUrl?: string;

  @ApiPropertyOptional({ example: '2026-06-15T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  datePaiement?: string;
}
