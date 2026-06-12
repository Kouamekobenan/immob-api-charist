import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { UrgencyLevel } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({ example: 'Fuite d\'eau dans la cuisine', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(150)
  titre: string;

  @ApiProperty({ example: 'Un robinet fuit depuis 2 jours, il y a de l\'eau par terre.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({ enum: UrgencyLevel, default: UrgencyLevel.MOYEN })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgence?: UrgencyLevel = UrgencyLevel.MOYEN;

  @ApiProperty({ example: 'uuid-du-bien' })
  @IsUUID('4')
  propertyId: string;

  @ApiProperty({ example: 'uuid-du-locataire' })
  @IsUUID('4')
  locataireId: string;
}
