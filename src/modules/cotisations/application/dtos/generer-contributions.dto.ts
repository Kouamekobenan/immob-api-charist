import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class GenererContributionsDto {
  @ApiPropertyOptional({
    example: '06-2026',
    description: 'Période cible (MM-YYYY). Défaut : mois courant.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{4}$/, { message: 'periode doit être au format MM-YYYY' })
  periode?: string;
}
