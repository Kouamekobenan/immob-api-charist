import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/i-user.repository';
import { IPasswordService, PASSWORD_SERVICE } from '../../domain/services/i-password.service';
import { ITokenService, TOKEN_SERVICE } from '../../domain/services/i-token.service';
import { RegisterDto } from '../dtos/register.dto';
import { AuthResponse } from '../responses/auth.response';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      nom: dto.nom,
      prenom: dto.prenom,
      telephone: dto.telephone,
      passwordHash,
      role: dto.role,
    });

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
