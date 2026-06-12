import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'jean.dupont@email.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'Dupont' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'Jean' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @IsString()
  prenom: string;

  @ApiPropertyOptional({ example: '+2250101020304' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ example: 'MotDePasse123!', minLength: 8 })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiPropertyOptional({ enum: Role, default: Role.LOCATAIRE })
  @IsOptional()
  @IsEnum(Role, { message: 'Rôle invalide' })
  role?: Role;
}
