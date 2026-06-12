import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ExpenseStatus } from '@prisma/client';
import {
  EXPENSE_REPOSITORY,
  IExpenseRepository,
} from '../../domain/repositories/i-expense.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';

@Injectable()
export class CancelExpenseUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(id: string): Promise<ExpenseEntity> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new NotFoundException(`Dépense introuvable (id: ${id})`);
    }

    if (!expense.canBeCancelled()) {
      throw new UnprocessableEntityException(
        `Impossible d'annuler une dépense au statut "${expense.statut}"`,
      );
    }

    return this.expenseRepository.update(id, { statut: ExpenseStatus.ANNULEE });
  }
}
