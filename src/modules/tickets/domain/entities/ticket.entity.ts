import { TicketStatus, UrgencyLevel } from '@prisma/client';

const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OUVERT]: [TicketStatus.ASSIGNE, TicketStatus.CLOTURE],
  [TicketStatus.ASSIGNE]: [TicketStatus.EN_COURS, TicketStatus.OUVERT, TicketStatus.CLOTURE],
  [TicketStatus.EN_COURS]: [TicketStatus.RESOLU, TicketStatus.CLOTURE],
  [TicketStatus.RESOLU]: [TicketStatus.CLOTURE],
  [TicketStatus.CLOTURE]: [],
};

export class TicketEntity {
  constructor(
    public readonly id: string,
    public readonly titre: string,
    public readonly description: string,
    public readonly photos: string[],
    public readonly urgence: UrgencyLevel,
    public readonly statut: TicketStatus,
    public readonly propertyId: string,
    public readonly locataireId: string,
    public readonly prestataireId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isOpen(): boolean {
    return this.statut === TicketStatus.OUVERT;
  }

  isAssigned(): boolean {
    return this.statut === TicketStatus.ASSIGNE;
  }

  isClosed(): boolean {
    return this.statut === TicketStatus.CLOTURE;
  }

  isResolved(): boolean {
    return this.statut === TicketStatus.RESOLU;
  }

  canTransitionTo(next: TicketStatus): boolean {
    return STATUS_TRANSITIONS[this.statut].includes(next);
  }

  canBeDeleted(): boolean {
    return this.statut === TicketStatus.OUVERT;
  }

  canAddPhotos(): boolean {
    return this.statut !== TicketStatus.CLOTURE;
  }
}
