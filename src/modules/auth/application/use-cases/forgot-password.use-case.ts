import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/i-user.repository';
import { IPasswordService, PASSWORD_SERVICE } from '../../domain/services/i-password.service';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';

export interface ForgotPasswordResult {
  message: string;
  resetToken?: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<ForgotPasswordResult> {
    const neutralMessage = 'Si cet email est associé à un compte, un lien de réinitialisation vous a été envoyé.';

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return { message: neutralMessage };
    }

    const resetToken = this.passwordService.generateResetToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepository.setPasswordResetToken(user.id, resetToken, expiry);

    // TODO : Intégrer un service d'email (Nodemailer, SendGrid, Resend)
    const isDev = process.env['NODE_ENV'] !== 'production';
    return {
      message: neutralMessage,
      ...(isDev && { resetToken }),
    };
  }
}
