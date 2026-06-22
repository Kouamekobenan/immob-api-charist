import { ApiPropertyOptional } from '@nestjs/swagger';
import { CotisationStatut } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateGroupeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  montantParMembre?: number;

  @ApiPropertyOptional({ enum: CotisationStatut })
  @IsOptional()
  @IsEnum(CotisationStatut)
  statut?: CotisationStatut;
}
