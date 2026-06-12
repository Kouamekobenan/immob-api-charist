import { Inject, Injectable } from '@nestjs/common';
import {
  EXPENSE_REPOSITORY,
  ExpenseFilters,
  IExpenseRepository,
} from '../../domain/repositories/i-expense.repository';
import { PaginatedResult } from '../../../contracts/domain/repositories/i-contract.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';
import { ExpenseQueryDto } from '../dtos/expense-query.dto';

@Injectable()
export class GetAllExpensesUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(query: ExpenseQueryDto): Promise<PaginatedResult<ExpenseEntity>> {
    const filters: ExpenseFilters = {
      payeurId: query.payeurId,
      propertyId: query.propertyId,
      beneficiaireId: query.beneficiaireId,
      categorie: query.categorie,
      statut: query.statut,
    };
    return this.expenseRepository.findAll(filters, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
