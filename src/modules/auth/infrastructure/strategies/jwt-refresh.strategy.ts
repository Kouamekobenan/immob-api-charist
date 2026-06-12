import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/i-user.repository';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET', 'fallback-refresh-secret'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: { sub: string; email: string; role: string },
  ): Promise<{ id: string; email: string; role: string; refreshToken: string }> {
    const refreshToken = req.headers.authorization?.split(' ')[1];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token invalide ou révoqué');
    }

    return { id: user.id, email: user.email, role: user.role, refreshToken };
  }
}
