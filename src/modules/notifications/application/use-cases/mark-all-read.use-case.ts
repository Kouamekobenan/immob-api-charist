import { Inject, Injectable } from '@nestjs/common';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/i-notification.repository';

@Injectable()
export class MarkAllReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<{ message: string }> {
    await this.notificationRepo.markAllAsRead(userId);
    return { message: 'Toutes les notifications ont été marquées comme lues' };
  }
}
