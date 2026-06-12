import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { IPasswordService } from '../../domain/services/i-password.service';

@Injectable()
export class BcryptPasswordService implements IPasswordService {
  private readonly SALT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  generateResetToken(): string {
    return randomUUID();
  }
}
