import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../presentation/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../presentation/decorators/current-user.decorator';
import { UsersQueryDto } from '../application/dtos/users-query.dto';
import { UpdateProfileDto } from '../application/dtos/update-profile.dto';
import { ChangePasswordDto } from '../application/dtos/change-password.dto';
import { ChangeRoleDto } from '../application/dtos/change-role.dto';
import { PaginatedUsersResponse, UserResponse } from '../application/responses/user.response';
import { GetAllUsersUseCase } from '../application/use-cases/get-all-users.use-case';
import { GetUserUseCase } from '../application/use-cases/get-user.use-case';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { ChangeRoleUseCase } from '../application/use-cases/change-role.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';

@ApiTags('Utilisateurs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly changeRoleUseCase: ChangeRoleUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users — Lister tous les utilisateurs
  // ─────────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Lister les utilisateurs',
    description: 'Filtres : role, search (nom/prénom/email/téléphone). Triés par date décroissante.',
  })
  @ApiResponse({ status: 200, type: PaginatedUsersResponse })
  async findAll(@Query() query: UsersQueryDto): Promise<PaginatedUsersResponse> {
    const result = await this.getAllUsersUseCase.execute(query);
    return {
      data: result.data.map(UserResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me — Profil de l'utilisateur connecté (détaillé)
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('me')
  @ApiOperation({ summary: 'Obtenir son propre profil complet' })
  @ApiResponse({ status: 200, type: UserResponse })
  async getMe(@CurrentUser() user: CurrentUserData): Promise<UserResponse> {
    const entity = await this.getUserUseCase.execute(user.id);
    return UserResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/:id — Profil d'un utilisateur
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: "Obtenir le profil d'un utilisateur par son identifiant" })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponse> {
    const entity = await this.getUserUseCase.execute(id);
    return UserResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /users/me — Modifier son propre profil
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier son propre profil',
    description: 'Champs modifiables : nom, prénom, téléphone. Le rôle et l\'email sont immuables via cette route.',
  })
  @ApiResponse({ status: 200, type: UserResponse })
  async updateMe(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponse> {
    const entity = await this.updateProfileUseCase.execute(user.id, dto);
    return UserResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /users/me/password — Changer son mot de passe
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Changer son mot de passe',
    description: 'Requiert le mot de passe actuel pour validation. Pour réinitialiser sans connaître l\'ancien, utiliser POST /auth/forgot-password.',
  })
  @ApiResponse({ status: 200, description: 'Mot de passe modifié avec succès' })
  @ApiResponse({ status: 401, description: 'Mot de passe actuel incorrect' })
  changePassword(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.changePasswordUseCase.execute(user.id, dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /users/:id/role — Changer le rôle d'un utilisateur
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Changer le rôle d'un utilisateur",
    description: 'Réservé aux administrateurs. Permet de promouvoir un LOCATAIRE en GERANT, BAILLEUR, etc.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeRoleDto,
  ): Promise<UserResponse> {
    const entity = await this.changeRoleUseCase.execute(id, dto);
    return UserResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /users/:id — Supprimer un utilisateur
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer définitivement un utilisateur',
    description: 'Réservé aux administrateurs. Impossible de supprimer son propre compte via cette route.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 400, description: 'Tentative de suppression de son propre compte' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() requester: CurrentUserData,
  ): Promise<void> {
    return this.deleteUserUseCase.execute(id, requester.id);
  }
}
