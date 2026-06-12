import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { PROPERTY_REPOSITORY } from './domain/repositories/i-property.repository';
import { PrismaPropertyRepository } from './infrastructure/repositories/prisma-property.repository';

import { CreatePropertyUseCase } from './application/use-cases/create-property.use-case';
import { GetPropertyUseCase } from './application/use-cases/get-property.use-case';
import { GetAllPropertiesUseCase } from './application/use-cases/get-all-properties.use-case';
import { UpdatePropertyUseCase } from './application/use-cases/update-property.use-case';
import { AssignManagerUseCase } from './application/use-cases/assign-manager.use-case';
import { RemoveManagerUseCase } from './application/use-cases/remove-manager.use-case';
import { DeletePropertyUseCase } from './application/use-cases/delete-property.use-case';

import { PropertiesController } from './presentation/properties.controller';

const useCases = [
  CreatePropertyUseCase,
  GetPropertyUseCase,
  GetAllPropertiesUseCase,
  UpdatePropertyUseCase,
  AssignManagerUseCase,
  RemoveManagerUseCase,
  DeletePropertyUseCase,
];

@Module({
  imports: [AuthModule],
  controllers: [PropertiesController],
  providers: [
    {
      provide: PROPERTY_REPOSITORY,
      useClass: PrismaPropertyRepository,
    },
    ...useCases,
  ],
  exports: [PROPERTY_REPOSITORY],
})
export class PropertiesModule {}
