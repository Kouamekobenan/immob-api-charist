import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Dupont', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nom?: string;

  @ApiPropertyOptional({ example: 'Jean', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  prenom?: string;

  @ApiPropertyOptional({ example: '+22507000000', nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[\d\s\-()]{7,20}$/, {
    message: 'Numéro de téléphone invalide',
  })
  telephone?: string;
}
