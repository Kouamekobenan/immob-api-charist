import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
  UserFilters,
} from '../../../domain/repositories/i-user.repository';
import { PaginatedResult } from '../../../../contracts/domain/repositories/i-contract.repository';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UsersQueryDto } from '../dtos/users-query.dto';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: UsersQueryDto): Promise<PaginatedResult<UserEntity>> {
    const filters: UserFilters = {
      role: query.role,
      search: query.search,
    };
    return this.userRepository.findAll(filters, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
