import { Role } from '@prisma/client';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';
import { UserEntity } from '../entities/user.entity';

export interface CreateUserData {
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  passwordHash: string;
  role?: Role;
}

export interface UpdateUserData {
  nom?: string;
  prenom?: string;
  telephone?: string | null;
  role?: Role;
}

export interface UserFilters {
  role?: Role;
  search?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByPasswordResetToken(token: string): Promise<UserEntity | null>;
  findAll(filters: UserFilters, pagination: PaginationOptions): Promise<PaginatedResult<UserEntity>>;
  create(data: CreateUserData): Promise<UserEntity>;
  update(id: string, data: UpdateUserData): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void>;
  clearPasswordResetToken(userId: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
