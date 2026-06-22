export class TranchePaiementEntity {
  constructor(
    public readonly id: string,
    public readonly montant: number,
    public readonly datePaiement: Date,
    public readonly referenceId: string | null,
    public readonly recuUrl: string | null,
    public readonly contributionId: string,
    public readonly createdAt: Date,
  ) {}
}
