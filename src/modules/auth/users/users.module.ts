import { Module } from '@nestjs/common';

import { AuthModule } from '../auth.module';

import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { ChangeRoleUseCase } from './application/use-cases/change-role.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

import { UsersController } from './presentation/users.controller';

const useCases = [
  GetAllUsersUseCase,
  GetUserUseCase,
  UpdateProfileUseCase,
  ChangePasswordUseCase,
  ChangeRoleUseCase,
  DeleteUserUseCase,
];

@Module({
  // AuthModule exporte USER_REPOSITORY, PASSWORD_SERVICE, JwtAuthGuard, PassportModule
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [...useCases],
})
export class UsersModule {}
