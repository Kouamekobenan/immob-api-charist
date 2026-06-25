import { CotisationStatut, PaymentStatus } from '@prisma/client';
import { CotisationGroupeEntity } from '../entities/cotisation-groupe.entity';
import { CotisationMembreEntity } from '../entities/cotisation-membre.entity';
import { ContributionEntity } from '../entities/contribution.entity';
import { TranchePaiementEntity } from '../entities/tranche-paiement.entity';

export const COTISATION_REPOSITORY = Symbol('COTISATION_REPOSITORY');

// ── Groupe ────────────────────────────────────────────────────────────────────

export interface CreateGroupeData {
  nom: string;
  description?: string;
  montantParMembre: number;
  propertyId?: string;
  createurId: string;
}

export interface UpdateGroupeData {
  nom?: string;
  description?: string;
  montantParMembre?: number;
  statut?: CotisationStatut;
}

// ── Membre ────────────────────────────────────────────────────────────────────

export interface AddMembreData {
  groupeId: string;
  locataireId: string;
}

// ── Contribution ──────────────────────────────────────────────────────────────

export interface ConfirmContributionData {
  referenceId?: string;
  recuUrl?: string;
  datePaiement?: Date;
}

// ── Tranches ──────────────────────────────────────────────────────────────────

export interface AddTrancheData {
  montant: number;
  referenceId?: string;
  recuUrl?: string;
  datePaiement?: Date;
}

export interface AddTrancheResult {
  tranche: TranchePaiementEntity;
  contribution: ContributionEntity;
}

// ── Résumé financier ──────────────────────────────────────────────────────────

export interface GroupeSummary {
  totalAttendu: number;
  totalCollecte: number;
  totalEnAttente: number;
  nombreMembresPayes: number;
  nombreMembresEnAttente: number;
  contributions: ContributionEntity[];
}

export interface PeriodeSummary {
  periode: string;
  totalAttendu: number;
  totalCollecte: number;
  totalEnAttente: number;
  nombreMembres: number;
  nombrePaye: number;
  nombrePartiel: number;
  nombreEnAttente: number;
  nombreRejete: number;
}

// ── Interface ─────────────────────────────────────────────────────────────────

export interface ICotisationRepository {
  // Groupe
  createGroupe(data: CreateGroupeData): Promise<CotisationGroupeEntity>;
  findGroupeById(id: string): Promise<CotisationGroupeEntity | null>;
  findAllGroupes(createurId?: string): Promise<CotisationGroupeEntity[]>;
  updateGroupe(id: string, data: UpdateGroupeData): Promise<CotisationGroupeEntity>;

  // Membres
  addMembre(data: AddMembreData): Promise<CotisationMembreEntity>;
  findMembre(groupeId: string, locataireId: string): Promise<CotisationMembreEntity | null>;
  findMembreById(membreId: string): Promise<CotisationMembreEntity | null>;
  findMembresActifs(groupeId: string): Promise<CotisationMembreEntity[]>;
  findMembresByLocataire(locataireId: string): Promise<CotisationMembreEntity[]>;
  setTresorier(groupeId: string, membreId: string): Promise<void>;
  removeMembre(membreId: string): Promise<void>;

  // Contributions
  createContribution(data: {
    groupeId: string;
    membreId: string;
    montant: number;
    periode: string;
  }): Promise<ContributionEntity>;
  createContributionsBulk(contributions: Array<{
    groupeId: string;
    membreId: string;
    montant: number;
    periode: string;
  }>): Promise<ContributionEntity[]>;
  hasContributionsForPeriode(groupeId: string, periode: string): Promise<boolean>;
  findContribution(groupeId: string, membreId: string, periode: string): Promise<ContributionEntity | null>;
  findContributionById(id: string): Promise<ContributionEntity | null>;
  findContributionsByGroupe(groupeId: string, periode?: string): Promise<ContributionEntity[]>;
  findContributionsByMembre(membreId: string): Promise<ContributionEntity[]>;
  updateContributionStatut(
    id: string,
    statut: PaymentStatus,
    data?: ConfirmContributionData,
    motifRejet?: string,
  ): Promise<ContributionEntity>;

  // Tranches
  addTranche(contributionId: string, data: AddTrancheData): Promise<AddTrancheResult>;
  findTranchesByContribution(contributionId: string): Promise<TranchePaiementEntity[]>;

  // Résumé
  getGroupeSummary(groupeId: string, periode: string): Promise<GroupeSummary>;
  getHistoriqueGroupePeriodes(groupeId: string): Promise<PeriodeSummary[]>;
}
