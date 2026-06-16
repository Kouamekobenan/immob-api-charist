import { NotificationType } from '@prisma/client';
import { NotificationEntity } from '../entities/notification.entity';
import { PaginatedResult, PaginationOptions } from '../../../contracts/domain/repositories/i-contract.repository';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export interface CreateNotificationData {
  titre: string;
  message: string;
  type: NotificationType;
  userId: string;
  expediteurId?: string;
}

export interface NotificationFilters {
  estLu?: boolean;
  type?: NotificationType;
}

export interface INotificationRepository {
  findById(id: string): Promise<NotificationEntity | null>;
  findByUser(userId: string, filters: NotificationFilters, pagination: PaginationOptions): Promise<PaginatedResult<NotificationEntity>>;
  countUnread(userId: string): Promise<number>;
  create(data: CreateNotificationData): Promise<NotificationEntity>;
  markAsRead(id: string): Promise<NotificationEntity>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
