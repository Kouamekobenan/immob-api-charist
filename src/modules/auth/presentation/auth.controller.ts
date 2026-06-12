import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RegisterDto } from '../application/dtos/register.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { ForgotPasswordDto } from '../application/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../application/dtos/reset-password.dto';
import { AuthResponse, AuthTokensResponse, UserProfileResponse } from '../application/responses/auth.response';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from '../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../application/use-cases/reset-password.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser, CurrentUserData } from './decorators/current-user.decorator';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Créer un nouveau compte utilisateur' })
  @ApiResponse({ status: 201, type: AuthResponse, description: 'Compte créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion et obtention des tokens JWT' })
  @ApiResponse({ status: 200, type: AuthResponse, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.loginUseCase.execute(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Déconnexion — invalide le refresh token' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async logout(@CurrentUser() user: CurrentUserData): Promise<{ message: string }> {
    await this.logoutUseCase.execute(user.id);
    return { message: 'Déconnexion réussie' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Rafraîchir les tokens JWT avec le refresh token' })
  @ApiResponse({ status: 200, type: AuthTokensResponse, description: 'Tokens renouvelés' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou révoqué' })
  refreshToken(@CurrentUser() user: CurrentUserData): Promise<AuthTokensResponse> {
    return this.refreshTokenUseCase.execute(user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander un lien de réinitialisation de mot de passe' })
  @ApiResponse({ status: 200, description: 'Email envoyé si le compte existe' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec le token reçu par email' })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.resetPasswordUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Obtenir le profil de l'utilisateur connecté" })
  @ApiResponse({ status: 200, type: UserProfileResponse })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  getProfile(@CurrentUser() user: CurrentUserData): CurrentUserData {
    return user;
  }
}
