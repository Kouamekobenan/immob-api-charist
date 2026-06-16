import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { NOTIFICATION_REPOSITORY } from './domain/repositories/i-notification.repository';
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository';

import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { CountUnreadUseCase } from './application/use-cases/count-unread.use-case';
import { MarkAsReadUseCase } from './application/use-cases/mark-as-read.use-case';
import { MarkAllReadUseCase } from './application/use-cases/mark-all-read.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';

import { NotificationsController } from './presentation/notifications.controller';

const useCases = [
  CreateNotificationUseCase,
  GetNotificationsUseCase,
  CountUnreadUseCase,
  MarkAsReadUseCase,
  MarkAllReadUseCase,
  DeleteNotificationUseCase,
];

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
    ...useCases,
  ],
  exports: [CreateNotificationUseCase],
})
export class NotificationsModule {}
