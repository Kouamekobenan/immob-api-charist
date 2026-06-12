import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jean.dupont@email.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString()
  password: string;
}
