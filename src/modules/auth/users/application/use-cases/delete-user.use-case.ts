import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/i-user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, requesterId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur introuvable (id: ${userId})`);
    }

    if (userId === requesterId) {
      throw new BadRequestException(
        'Impossible de supprimer votre propre compte via cette route',
      );
    }

    await this.userRepository.delete(userId);
  }
}
