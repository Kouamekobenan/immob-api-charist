import { CotisationStatut } from '@prisma/client';

export class CotisationGroupeEntity {
  constructor(
    public readonly id: string,
    public readonly nom: string,
    public readonly description: string | null,
    public readonly montantParMembre: number,
    public readonly statut: CotisationStatut,
    public readonly propertyId: string | null,
    public readonly createurId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isActif(): boolean {
    return this.statut === CotisationStatut.ACTIF;
  }

  canAddMembre(): boolean {
    return this.statut === CotisationStatut.ACTIF;
  }

  canGenererContributions(): boolean {
    return this.statut === CotisationStatut.ACTIF;
  }
}
