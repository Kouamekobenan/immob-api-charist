import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignManagerDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Identifiant de l\'utilisateur à assigner comme gérant',
  })
  @IsNotEmpty({ message: 'L\'identifiant du gérant est requis' })
  @IsUUID('4', { message: 'Identifiant du gérant invalide' })
  gerantId: string;
}
