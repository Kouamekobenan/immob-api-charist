import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Token invalide' })
  token: string;

  @ApiProperty({ example: 'NouveauMotDePasse123!', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;
}
