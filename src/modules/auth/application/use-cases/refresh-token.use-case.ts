import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/i-user.repository';
import { ITokenService, TOKEN_SERVICE } from '../../domain/services/i-token.service';
import { AuthTokensResponse } from '../responses/auth.response';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(userId: string): Promise<AuthTokensResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
