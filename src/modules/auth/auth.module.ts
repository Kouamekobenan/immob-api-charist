import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// ── Domain tokens ─────────────────────────────────────────────────────────────
import { USER_REPOSITORY } from './domain/repositories/i-user.repository';
import { PASSWORD_SERVICE } from './domain/services/i-password.service';
import { TOKEN_SERVICE } from './domain/services/i-token.service';

// ── Application — Use Cases ───────────────────────────────────────────────────
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';

// ── Infrastructure ────────────────────────────────────────────────────────────
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';

// ── Presentation ──────────────────────────────────────────────────────────────
import { AuthController } from './presentation/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { JwtRefreshGuard } from './presentation/guards/jwt-refresh.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (configService: ConfigService): any => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('ACCESS_TOKEN_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Infrastructure bindings (interface → implémentation concrète)
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_SERVICE, useClass: BcryptPasswordService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },

    // Strategies Passport
    JwtStrategy,
    JwtRefreshStrategy,

    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,

    // Guards (exposés pour les autres modules)
    JwtAuthGuard,
    JwtRefreshGuard,
  ],
  exports: [
    JwtAuthGuard,
    JwtRefreshGuard,
    PassportModule,
    USER_REPOSITORY,
    PASSWORD_SERVICE,
  ],
})
export class AuthModule {}
