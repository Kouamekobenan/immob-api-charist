import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { NotificationEntity } from '../../domain/entities/notification.entity';

export class NotificationResponse {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() message: string;
  @ApiProperty({ enum: NotificationType }) type: NotificationType;
  @ApiProperty() estLu: boolean;
  @ApiProperty() userId: string;
  @ApiPropertyOptional({ nullable: true }) expediteurId: string | null;
  @ApiProperty() createdAt: Date;

  static fromEntity(entity: NotificationEntity): NotificationResponse {
    const res = new NotificationResponse();
    res.id = entity.id;
    res.titre = entity.titre;
    res.message = entity.message;
    res.type = entity.type;
    res.estLu = entity.estLu;
    res.userId = entity.userId;
    res.expediteurId = entity.expediteurId;
    res.createdAt = entity.createdAt;
    return res;
  }
}

export class PaginatedNotificationsResponse {
  @ApiProperty({ type: [NotificationResponse] }) data: NotificationResponse[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class UnreadCountResponse {
  @ApiProperty({ example: 5, description: 'Nombre de notifications non lues' })
  count: number;
}
