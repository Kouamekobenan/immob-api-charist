import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'AncienMotDePasse123!' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NouveauMotDePasse456!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
