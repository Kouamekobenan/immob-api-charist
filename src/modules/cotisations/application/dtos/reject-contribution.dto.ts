import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectContributionDto {
  @ApiPropertyOptional({
    example: 'Référence mobile money introuvable',
    description: 'Motif du rejet communiqué au locataire',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motif?: string;
}
