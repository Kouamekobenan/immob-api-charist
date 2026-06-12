export class ContractEntity {
  constructor(
    public readonly id: string,
    public readonly dateDebut: Date,
    public readonly dateFin: Date | null,
    public readonly loyerTotal: number,
    public readonly estActif: boolean,
    public readonly propertyId: string,
    public readonly locataireId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isActive(): boolean {
    return this.estActif;
  }

  isExpired(): boolean {
    if (!this.dateFin) return false;
    return this.dateFin < new Date();
  }

  /** Vérifie que la période est cohérente (début < fin) */
  isDateRangeValid(): boolean {
    if (!this.dateFin) return true;
    return this.dateDebut < this.dateFin;
  }

  /** Calcule la durée en mois (approximatif) */
  getDurationInMonths(): number | null {
    if (!this.dateFin) return null;
    const diff = this.dateFin.getTime() - this.dateDebut.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24 * 30));
  }
}
