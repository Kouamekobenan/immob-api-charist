import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  EXPENSE_REPOSITORY,
  IExpenseRepository,
} from '../../domain/repositories/i-expense.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';
import { CreateExpenseDto } from '../dtos/create-expense.dto';

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: IExpenseRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateExpenseDto): Promise<ExpenseEntity> {
    // Valider le payeur (doit être GERANT ou BAILLEUR ou SUPER_ADMIN)
    const payeur = await this.prisma.user.findUnique({ where: { id: dto.payeurId } });
    if (!payeur) {
      throw new NotFoundException(`Payeur introuvable (id: ${dto.payeurId})`);
    }
    if (!['GERANT', 'BAILLEUR', 'SUPER_ADMIN'].includes(payeur.role)) {
      throw new UnprocessableEntityException(
        `L'utilisateur "${payeur.email}" n'est pas autorisé à créer une dépense (rôle requis : GERANT ou BAILLEUR)`,
      );
    }

    // Valider le bien si fourni
    if (dto.propertyId) {
      const property = await this.prisma.property.findUnique({
        where: { id: dto.propertyId },
      });
      if (!property) {
        throw new NotFoundException(`Bien introuvable (id: ${dto.propertyId})`);
      }
    }

    // Valider le ticket si fourni + vérifier qu'il n'a pas déjà une dépense
    if (dto.ticketId) {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: dto.ticketId },
        include: { expense: true },
      });
      if (!ticket) {
        throw new NotFoundException(`Ticket introuvable (id: ${dto.ticketId})`);
      }
      if (ticket.expense) {
        throw new ConflictException(
          `Ce ticket a déjà une dépense associée (id: ${ticket.expense.id})`,
        );
      }
    }

    // Valider le bénéficiaire interne si fourni
    if (dto.beneficiaireId) {
      const beneficiaire = await this.prisma.user.findUnique({
        where: { id: dto.beneficiaireId },
      });
      if (!beneficiaire) {
        throw new NotFoundException(`Bénéficiaire introuvable (id: ${dto.beneficiaireId})`);
      }
    }

    return this.expenseRepository.create({
      titre: dto.titre,
      description: dto.description,
      montant: dto.montant,
      date: dto.date,
      categorie: dto.categorie,
      beneficiaireNom: dto.beneficiaireNom,
      payeurId: dto.payeurId,
      beneficiaireId: dto.beneficiaireId,
      propertyId: dto.propertyId,
      ticketId: dto.ticketId,
    });
  }
}
