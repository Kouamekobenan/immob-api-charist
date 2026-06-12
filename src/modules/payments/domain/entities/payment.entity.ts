import { PaymentStatus } from '@prisma/client';

export class PaymentEntity {
  constructor(
    public readonly id: string,
    public readonly montant: number,
    public readonly datePaiement: Date | null,
    public readonly periode: string,
    public readonly statut: PaymentStatus,
    public readonly referenceId: string | null,
    public readonly recuUrl: string | null,
    public readonly contractId: string,
    public readonly locataireId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isPaid(): boolean {
    return this.statut === PaymentStatus.PAYE;
  }

  isPending(): boolean {
    return this.statut === PaymentStatus.EN_ATTENTE;
  }

  isRejected(): boolean {
    return this.statut === PaymentStatus.REJETE;
  }

  isFailed(): boolean {
    return this.statut === PaymentStatus.ECHOUE;
  }

  canBeDeleted(): boolean {
    return (
      this.statut === PaymentStatus.EN_ATTENTE ||
      this.statut === PaymentStatus.ECHOUE
    );
  }

  canBeConfirmed(): boolean {
    return this.statut === PaymentStatus.EN_ATTENTE;
  }

  canBeRejected(): boolean {
    return this.statut === PaymentStatus.EN_ATTENTE;
  }
}
