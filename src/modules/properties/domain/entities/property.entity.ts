import { PropertyType } from '@prisma/client';

export class PropertyEntity {
  constructor(
    public readonly id: string,
    public readonly titre: string,
    public readonly description: string | null,
    public readonly adresse: string,
    public readonly ville: string,
    public readonly type: PropertyType,
    public readonly loyerDeBase: number,
    public readonly charges: number,
    public readonly estOccupe: boolean,
    public readonly bailleurId: string,
    public readonly gerantId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /** Loyer total (base + charges) */
  get loyerTotal(): number {
    return this.loyerDeBase + this.charges;
  }

  isManaged(): boolean {
    return this.gerantId !== null;
  }

  isOccupied(): boolean {
    return this.estOccupe;
  }

  isAvailable(): boolean {
    return !this.estOccupe;
  }
}
