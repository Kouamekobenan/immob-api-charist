import { Injectable } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  CreateNotificationData,
  INotificationRepository,
  NotificationFilters,
} from '../../domain/repositories/i-notification.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { PaginatedResult, PaginationOptions } from '../../../contracts/domain/repositories/i-contract.repository';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<NotificationEntity | null> {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    return n ? this.toEntity(n) : null;
  }

  async findByUser(
    userId: string,
    filters: NotificationFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<NotificationEntity>> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(filters.estLu !== undefined && { estLu: filters.estLu }),
      ...(filters.type && { type: filters.type }),
    };

    const skip = (pagination.page - 1) * pagination.limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications.map((n) => this.toEntity(n)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, estLu: false } });
  }

  async create(data: CreateNotificationData): Promise<NotificationEntity> {
    const n = await this.prisma.notification.create({
      data: {
        titre: data.titre,
        message: data.message,
        type: data.type,
        user: { connect: { id: data.userId } },
        ...(data.expediteurId && {
          expediteur: { connect: { id: data.expediteurId } },
        }),
      },
    });
    return this.toEntity(n);
  }

  async markAsRead(id: string): Promise<NotificationEntity> {
    const n = await this.prisma.notification.update({
      where: { id },
      data: { estLu: true },
    });
    return this.toEntity(n);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, estLu: false },
      data: { estLu: true },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({ where: { id } });
  }

  private toEntity(n: Notification): NotificationEntity {
    return new NotificationEntity(
      n.id,
      n.titre,
      n.message,
      n.type,
      n.estLu,
      n.userId,
      n.expediteurId,
      n.createdAt,
    );
  }
}
