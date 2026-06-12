import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/i-user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur introuvable (id: ${id})`);
    }
    return user;
  }
}
