import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/i-notification.repository';
import { IUserRepository, USER_REPOSITORY } from '../../../auth/domain/repositories/i-user.repository';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { NotificationEntity } from '../../domain/entities/notification.entity';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepo: INotificationRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: CreateNotificationDto): Promise<NotificationEntity> {
    const destinataire = await this.userRepo.findById(dto.userId);
    if (!destinataire) throw new NotFoundException('Destinataire introuvable');

    if (dto.expediteurId) {
      const expediteur = await this.userRepo.findById(dto.expediteurId);
      if (!expediteur) throw new NotFoundException('Expéditeur introuvable');
    }

    return this.notificationRepo.create({
      titre: dto.titre,
      message: dto.message,
      type: dto.type,
      userId: dto.userId,
      expediteurId: dto.expediteurId,
    });
  }
}
