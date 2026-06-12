export interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
  generateResetToken(): string;
}

export const PASSWORD_SERVICE = Symbol('PASSWORD_SERVICE');
