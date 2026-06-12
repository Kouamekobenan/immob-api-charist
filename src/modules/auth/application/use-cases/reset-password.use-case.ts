import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/i-user.repository';
import { IPasswordService, PASSWORD_SERVICE } from '../../domain/services/i-password.service';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findByPasswordResetToken(dto.token);

    if (!user || !user.isPasswordResetTokenValid()) {
      throw new BadRequestException('Token de réinitialisation invalide ou expiré');
    }

    const passwordHash = await this.passwordService.hash(dto.newPassword);

    await this.userRepository.updatePassword(user.id, passwordHash);
    await this.userRepository.clearPasswordResetToken(user.id);
    await this.userRepository.updateRefreshToken(user.id, null);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
