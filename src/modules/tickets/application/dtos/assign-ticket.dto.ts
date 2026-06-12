import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignTicketDto {
  @ApiProperty({ example: 'uuid-du-prestataire' })
  @IsUUID('4')
  prestataireId: string;
}
