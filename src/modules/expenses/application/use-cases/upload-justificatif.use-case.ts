import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../../../cloudinary/claudinary.service';
import {
  EXPENSE_REPOSITORY,
  IExpenseRepository,
} from '../../domain/repositories/i-expense.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';

@Injectable()
export class UploadJustificatifUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: IExpenseRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async execute(id: string, file: Express.Multer.File): Promise<ExpenseEntity> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new NotFoundException(`Dépense introuvable (id: ${id})`);
    }

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Upload vers Cloudinary (image pour photo de facture, peut aussi être PDF via raw)
    const justificatifUrl = await this.cloudinary.upload(file, 'image');

    return this.expenseRepository.update(id, { justificatifUrl });
  }
}
