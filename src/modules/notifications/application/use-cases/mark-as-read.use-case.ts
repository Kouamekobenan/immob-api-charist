import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/i-notification.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';

@Injectable()
export class MarkAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepo.findById(id);
    if (!notification) throw new NotFoundException('Notification introuvable');
    return this.notificationRepo.markAsRead(id);
  }
}
