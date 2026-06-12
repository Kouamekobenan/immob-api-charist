import { ExpenseCategory, ExpenseStatus } from '@prisma/client';

export class ExpenseEntity {
  constructor(
    public readonly id: string,
    public readonly titre: string,
    public readonly description: string | null,
    public readonly montant: number,
    public readonly date: Date,
    public readonly categorie: ExpenseCategory,
    public readonly statut: ExpenseStatus,
    public readonly beneficiaireNom: string,
    public readonly referenceId: string | null,
    public readonly justificatifUrl: string | null,
    public readonly payeurId: string,
    public readonly beneficiaireId: string | null,
    public readonly propertyId: string | null,
    public readonly ticketId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isPending(): boolean {
    return this.statut === ExpenseStatus.EN_ATTENTE;
  }

  isPaid(): boolean {
    return this.statut === ExpenseStatus.PAYEE;
  }

  isCancelled(): boolean {
    return this.statut === ExpenseStatus.ANNULEE;
  }

  canBePaid(): boolean {
    return this.statut === ExpenseStatus.EN_ATTENTE;
  }

  canBeCancelled(): boolean {
    return this.statut === ExpenseStatus.EN_ATTENTE;
  }

  canBeDeleted(): boolean {
    return this.statut === ExpenseStatus.EN_ATTENTE || this.statut === ExpenseStatus.ANNULEE;
  }
}
