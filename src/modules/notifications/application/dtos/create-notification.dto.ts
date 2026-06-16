import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Votre loyer de juin est disponible', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  titre: string;

  @ApiProperty({ example: 'Votre avis de loyer pour la période 06-2026 a été généré.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(1000)
  message: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.MESSAGE_DIRECT })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'uuid-du-destinataire', description: 'ID de l\'utilisateur destinataire' })
  @IsUUID('4')
  userId: string;

  @ApiPropertyOptional({ example: 'uuid-de-l-expediteur', description: 'ID de l\'expéditeur (null = système)' })
  @IsOptional()
  @IsUUID('4')
  expediteurId?: string;
}
