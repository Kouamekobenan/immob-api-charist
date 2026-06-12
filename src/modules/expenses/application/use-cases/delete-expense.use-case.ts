import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EXPENSE_REPOSITORY,
  IExpenseRepository,
} from '../../domain/repositories/i-expense.repository';

@Injectable()
export class DeleteExpenseUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new NotFoundException(`Dépense introuvable (id: ${id})`);
    }

    if (!expense.canBeDeleted()) {
      throw new BadRequestException(
        `Impossible de supprimer une dépense au statut "${expense.statut}". Seules les dépenses EN_ATTENTE ou ANNULEE peuvent être supprimées.`,
      );
    }

    await this.expenseRepository.delete(id);
  }
}
