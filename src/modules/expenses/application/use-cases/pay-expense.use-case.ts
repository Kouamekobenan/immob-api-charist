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
import { PayExpenseDto } from '../dtos/pay-expense.dto';

@Injectable()
export class PayExpenseUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(id: string, dto: PayExpenseDto): Promise<ExpenseEntity> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new NotFoundException(`Dépense introuvable (id: ${id})`);
    }

    if (!expense.canBePaid()) {
      throw new UnprocessableEntityException(
        `Impossible de confirmer le paiement d'une dépense au statut "${expense.statut}"`,
      );
    }

    return this.expenseRepository.update(id, {
      statut: ExpenseStatus.PAYEE,
      referenceId: dto.referenceId ?? null,
      justificatifUrl: dto.justificatifUrl ?? null,
    });
  }
}
