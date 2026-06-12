import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/i-user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';
import { ChangeRoleDto } from '../dtos/change-role.dto';

@Injectable()
export class ChangeRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, dto: ChangeRoleDto): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur introuvable (id: ${userId})`);
    }

    return this.userRepository.update(userId, { role: dto.role });
  }
}
