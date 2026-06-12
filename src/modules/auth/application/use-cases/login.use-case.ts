import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/i-user.repository';
import { IPasswordService, PASSWORD_SERVICE } from '../../domain/services/i-password.service';
import { ITokenService, TOKEN_SERVICE } from '../../domain/services/i-token.service';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponse } from '../responses/auth.response';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await this.passwordService.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        telephone: user.telephone ?? undefined,
      },
      tokens,
    };
  }
}
