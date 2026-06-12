import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAuditLogDto {
  @ApiProperty({
    example: 'TICKET_STATUS_UPDATE',
    description: "Action effectuée (ex: TICKET_STATUS_UPDATE, PAYMENT_RECEIVED, CONTRACT_CREATED)",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  action: string;

  @ApiProperty({
    example: 'Ticket',
    description: 'Nom du modèle Prisma concerné (ex: Ticket, Payment, Contract, Property)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  table: string;

  @ApiProperty({ example: 'uuid-de-lenregistrement' })
  @IsUUID('4')
  enregistrementId: string;

  @ApiProperty({
    example: { avant: { statut: 'OUVERT' }, apres: { statut: 'ASSIGNE' } },
    description: 'Métadonnées libres (état avant/après, données contextuelles…)',
  })
  @IsObject()
  details: Record<string, unknown>;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ipAdresse?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0 ...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @ApiPropertyOptional({ example: 'uuid-utilisateur', nullable: true })
  @IsOptional()
  @IsUUID('4')
  userId?: string;
}
