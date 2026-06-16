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
  Post,
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

import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../auth/presentation/decorators/current-user.decorator';
import { CreateNotificationDto } from '../application/dtos/create-notification.dto';
import { NotificationQueryDto } from '../application/dtos/notification-query.dto';
import {
  NotificationResponse,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
} from '../application/responses/notification.response';
import { CreateNotificationUseCase } from '../application/use-cases/create-notification.use-case';
import { GetNotificationsUseCase } from '../application/use-cases/get-notifications.use-case';
import { CountUnreadUseCase } from '../application/use-cases/count-unread.use-case';
import { MarkAsReadUseCase } from '../application/use-cases/mark-as-read.use-case';
import { MarkAllReadUseCase } from '../application/use-cases/mark-all-read.use-case';
import { DeleteNotificationUseCase } from '../application/use-cases/delete-notification.use-case';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly countUnreadUseCase: CountUnreadUseCase,
    private readonly markAsReadUseCase: MarkAsReadUseCase,
    private readonly markAllReadUseCase: MarkAllReadUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /notifications — Créer et envoyer une notification
  // ─────────────────────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Envoyer une notification à un utilisateur',
    description: 'Crée une notification pour un destinataire. Si expediteurId est absent, c\'est une notification système.',
  })
  @ApiResponse({ status: 201, type: NotificationResponse })
  @ApiResponse({ status: 404, description: 'Destinataire ou expéditeur introuvable' })
  async create(@Body() dto: CreateNotificationDto): Promise<NotificationResponse> {
    const entity = await this.createNotificationUseCase.execute(dto);
    return NotificationResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /notifications/me — Mes notifications (utilisateur connecté)
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('me')
  @ApiOperation({
    summary: 'Récupérer mes notifications',
    description: 'Retourne les notifications de l\'utilisateur connecté. Filtres : estLu, type.',
  })
  @ApiResponse({ status: 200, type: PaginatedNotificationsResponse })
  async getMyNotifications(
    @CurrentUser() user: CurrentUserData,
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    const result = await this.getNotificationsUseCase.execute(user.id, query);
    return {
      data: result.data.map(NotificationResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /notifications/me/unread-count — Nombre de non lues
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('me/unread-count')
  @ApiOperation({ summary: 'Nombre de notifications non lues (pour le badge)' })
  @ApiResponse({ status: 200, type: UnreadCountResponse })
  async getUnreadCount(@CurrentUser() user: CurrentUserData): Promise<UnreadCountResponse> {
    return this.countUnreadUseCase.execute(user.id);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /notifications/user/:userId — Notifications d'un utilisateur (admin)
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les notifications d\'un utilisateur (admin)' })
  @ApiParam({ name: 'userId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedNotificationsResponse })
  async getByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    const result = await this.getNotificationsUseCase.execute(userId, query);
    return {
      data: result.data.map(NotificationResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /notifications/:id/read — Marquer une notification comme lue
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: NotificationResponse })
  @ApiResponse({ status: 404, description: 'Notification introuvable' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string): Promise<NotificationResponse> {
    const entity = await this.markAsReadUseCase.execute(id);
    return NotificationResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /notifications/me/read-all — Tout marquer comme lu
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch('me/read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer toutes mes notifications comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications ont été marquées comme lues' })
  async markAllRead(@CurrentUser() user: CurrentUserData): Promise<{ message: string }> {
    return this.markAllReadUseCase.execute(user.id);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /notifications/:id — Supprimer une notification
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une notification' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Notification supprimée' })
  @ApiResponse({ status: 404, description: 'Notification introuvable' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteNotificationUseCase.execute(id);
  }
}
