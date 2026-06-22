import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddMembreDto {
  @ApiProperty({ format: 'uuid', description: 'ID du locataire à ajouter au groupe' })
  @IsUUID()
  locataireId: string;
}
