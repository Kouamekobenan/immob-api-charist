import { PaymentStatus } from '@prisma/client';

export class ContributionEntity {
  constructor(
    public readonly id: string,
    public readonly montant: number,
    public readonly montantPaye: number,
    public readonly periode: string,
    public readonly statut: PaymentStatus,
    public readonly datePaiement: Date | null,
    public readonly referenceId: string | null,
    public readonly recuUrl: string | null,
    public readonly groupeId: string,
    public readonly membreId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly membreNom: string | null = null,
    public readonly membrePrenom: string | null = null,
    public readonly groupeNom: string | null = null,
  ) {}

  montantRestant(): number {
    return Math.max(0, this.montant - this.montantPaye);
  }

  isPaid(): boolean {
    return this.statut === PaymentStatus.PAYE;
  }

  isPending(): boolean {
    return this.statut === PaymentStatus.EN_ATTENTE;
  }

  isPartiel(): boolean {
    return this.statut === PaymentStatus.PARTIEL;
  }

  canAcceptTranche(): boolean {
    return (
      this.statut === PaymentStatus.EN_ATTENTE ||
      this.statut === PaymentStatus.PARTIEL
    );
  }

  canBeConfirmed(): boolean {
    return this.statut === PaymentStatus.EN_ATTENTE;
  }

  canBeRejected(): boolean {
    return (
      this.statut === PaymentStatus.EN_ATTENTE ||
      this.statut === PaymentStatus.PARTIEL
    );
  }
}
