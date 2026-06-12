import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketStatusDto {
  @ApiProperty({
    enum: TicketStatus,
    description: `Transitions autorisées :
      OUVERT → ASSIGNE, CLOTURE
      ASSIGNE → EN_COURS, OUVERT, CLOTURE
      EN_COURS → RESOLU, CLOTURE
      RESOLU → CLOTURE`,
  })
  @IsEnum(TicketStatus)
  statut: TicketStatus;
}
