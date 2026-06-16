import { NotificationType } from '@prisma/client';

export class NotificationEntity {
  constructor(
    public readonly id: string,
    public readonly titre: string,
    public readonly message: string,
    public readonly type: NotificationType,
    public readonly estLu: boolean,
    public readonly userId: string,
    public readonly expediteurId: string | null,
    public readonly createdAt: Date,
  ) {}

  isRead(): boolean {
    return this.estLu;
  }

  isSystemNotification(): boolean {
    return this.expediteurId === null;
  }

  isDirectMessage(): boolean {
    return this.type === NotificationType.MESSAGE_DIRECT;
  }
}
