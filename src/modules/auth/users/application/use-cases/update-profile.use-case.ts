import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/i-user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur introuvable (id: ${userId})`);
    }

    return this.userRepository.update(userId, {
      nom: dto.nom,
      prenom: dto.prenom,
      telephone: dto.telephone,
    });
  }
}
