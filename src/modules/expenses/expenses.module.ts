import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

import { EXPENSE_REPOSITORY } from './domain/repositories/i-expense.repository';
import { PrismaExpenseRepository } from './infrastructure/repositories/prisma-expense.repository';

import { CreateExpenseUseCase } from './application/use-cases/create-expense.use-case';
import { GetExpenseUseCase } from './application/use-cases/get-expense.use-case';
import { GetAllExpensesUseCase } from './application/use-cases/get-all-expenses.use-case';
import { PayExpenseUseCase } from './application/use-cases/pay-expense.use-case';
import { CancelExpenseUseCase } from './application/use-cases/cancel-expense.use-case';
import { UploadJustificatifUseCase } from './application/use-cases/upload-justificatif.use-case';
import { DeleteExpenseUseCase } from './application/use-cases/delete-expense.use-case';

import { ExpensesController } from './presentation/expenses.controller';

const useCases = [
  CreateExpenseUseCase,
  GetExpenseUseCase,
  GetAllExpensesUseCase,
  PayExpenseUseCase,
  CancelExpenseUseCase,
  UploadJustificatifUseCase,
  DeleteExpenseUseCase,
];

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [ExpensesController],
  providers: [
    {
      provide: EXPENSE_REPOSITORY,
      useClass: PrismaExpenseRepository,
    },
    ...useCases,
  ],
})
export class ExpensesModule {}
