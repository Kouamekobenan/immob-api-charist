import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/i-user.repository';
import {
  IPasswordService,
  PASSWORD_SERVICE,
} from '../../../domain/services/i-password.service';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur introuvable (id: ${userId})`);
    }

    const isValid = await this.passwordService.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const newHash = await this.passwordService.hash(dto.newPassword);
    await this.userRepository.updatePassword(userId, newHash);

    return { message: 'Mot de passe modifié avec succès' };
  }
}
