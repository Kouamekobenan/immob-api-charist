import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EXPENSE_REPOSITORY,
  IExpenseRepository,
} from '../../domain/repositories/i-expense.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';

@Injectable()
export class GetExpenseUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(id: string): Promise<ExpenseEntity> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new NotFoundException(`Dépense introuvable (id: ${id})`);
    }
    return expense;
  }
}
