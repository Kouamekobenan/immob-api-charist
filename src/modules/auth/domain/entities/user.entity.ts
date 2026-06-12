import { Role } from '@prisma/client';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly nom: string,
    public readonly prenom: string,
    public readonly role: Role,
    public readonly passwordHash: string,
    public readonly telephone: string | null = null,
    public readonly refreshToken: string | null = null,
    public readonly passwordResetToken: string | null = null,
    public readonly passwordResetExpiry: Date | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  isPasswordResetTokenValid(): boolean {
    if (!this.passwordResetToken || !this.passwordResetExpiry) return false;
    return this.passwordResetExpiry > new Date();
  }

  hasRole(role: Role): boolean {
    return this.role === role;
  }

  get fullName(): string {
    return `${this.prenom} ${this.nom}`;
  }
}
