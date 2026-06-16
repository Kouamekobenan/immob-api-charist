import { Inject, Injectable } from '@nestjs/common';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/i-notification.repository';
import { NotificationQueryDto } from '../dtos/notification-query.dto';
import { PaginatedResult } from '../../../contracts/domain/repositories/i-contract.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(userId: string, query: NotificationQueryDto): Promise<PaginatedResult<NotificationEntity>> {
    return this.notificationRepo.findByUser(
      userId,
      { estLu: query.estLu, type: query.type },
      { page: query.page ?? 1, limit: query.limit ?? 20 },
    );
  }
}
