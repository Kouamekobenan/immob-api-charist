import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  CreateUserData,
  IUserRepository,
  UpdateUserData,
  UserFilters,
} from '../../domain/repositories/i-user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  async findByPasswordResetToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
    return user ? this.toEntity(user) : null;
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        password: data.passwordHash,
        role: data.role ?? Role.LOCATAIRE,
      },
    });
    return this.toEntity(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  }

  async setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    });
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordResetToken: null, passwordResetExpiry: null },
    });
  }

  async findAll(
    filters: UserFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<UserEntity>> {
    const where: Prisma.UserWhereInput = {
      ...(filters.role && { role: filters.role }),
      ...(filters.search && {
        OR: [
          { nom: { contains: filters.search, mode: 'insensitive' } },
          { prenom: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { telephone: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const skip = (pagination.page - 1) * pagination.limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => this.toEntity(u)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.nom !== undefined && { nom: data.nom }),
        ...(data.prenom !== undefined && { prenom: data.prenom }),
        ...(data.telephone !== undefined && { telephone: data.telephone }),
        ...(data.role !== undefined && { role: data.role }),
      },
    });
    return this.toEntity(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toEntity(user: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: Role;
    password: string;
    telephone: string | null;
    refreshToken: string | null;
    passwordResetToken: string | null;
    passwordResetExpiry: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return new UserEntity(
      user.id,
      user.email,
      user.nom,
      user.prenom,
      user.role,
      user.password,
      user.telephone,
      user.refreshToken,
      user.passwordResetToken,
      user.passwordResetExpiry,
      user.createdAt,
      user.updatedAt,
    );
  }
}
