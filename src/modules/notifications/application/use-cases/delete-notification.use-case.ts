import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/i-notification.repository';

@Injectable()
export class DeleteNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const notification = await this.notificationRepo.findById(id);
    if (!notification) throw new NotFoundException('Notification introuvable');
    await this.notificationRepo.delete(id);
  }
}
