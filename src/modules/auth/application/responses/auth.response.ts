import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuthTokensResponse {
  @ApiProperty({ description: 'JWT access token (valide 15 min)' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token (valide 7 jours)' })
  refreshToken: string;
}

export class UserProfileResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'jean.dupont@email.com' })
  email: string;

  @ApiProperty({ example: 'Dupont' })
  nom: string;

  @ApiProperty({ example: 'Jean' })
  prenom: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiPropertyOptional({ example: '+2250101020304' })
  telephone?: string;
}

export class AuthResponse {
  @ApiProperty({ type: UserProfileResponse })
  user: UserProfileResponse;

  @ApiProperty({ type: AuthTokensResponse })
  tokens: AuthTokensResponse;
}
