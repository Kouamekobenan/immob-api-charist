import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CotisationStatut, PaymentStatus } from '@prisma/client';
import { CotisationGroupeEntity } from '../../domain/entities/cotisation-groupe.entity';
import { CotisationMembreEntity } from '../../domain/entities/cotisation-membre.entity';
import { ContributionEntity } from '../../domain/entities/contribution.entity';
import { TranchePaiementEntity } from '../../domain/entities/tranche-paiement.entity';
import { GroupeSummary } from '../../domain/repositories/i-cotisation.repository';
import type { MonBilan } from '../use-cases/get-mes-contributions.use-case';
import type { MonGroupe } from '../use-cases/get-mes-groupes.use-case';
import type { PeriodeSummary } from '../../domain/repositories/i-cotisation.repository';

// ── Groupe ────────────────────────────────────────────────────────────────────

export class GroupeResponse {
  @ApiProperty() id: string;
  @ApiProperty() nom: string;
  @ApiPropertyOptional({ nullable: true }) description: string | null;
  @ApiProperty() montantParMembre: number;
  @ApiProperty({ enum: CotisationStatut }) statut: CotisationStatut;
  @ApiPropertyOptional({ nullable: true }) propertyId: string | null;
  @ApiProperty() createurId: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(e: CotisationGroupeEntity): GroupeResponse {
    const r = new GroupeResponse();
    r.id = e.id;
    r.nom = e.nom;
    r.description = e.description;
    r.montantParMembre = e.montantParMembre;
    r.statut = e.statut;
    r.propertyId = e.propertyId;
    r.createurId = e.createurId;
    r.createdAt = e.createdAt;
    r.updatedAt = e.updatedAt;
    return r;
  }
}

// ── Membre ────────────────────────────────────────────────────────────────────

export class MembreResponse {
  @ApiProperty() id: string;
  @ApiProperty() groupeId: string;
  @ApiProperty() locataireId: string;
  @ApiPropertyOptional({ nullable: true }) nom: string | null;
  @ApiPropertyOptional({ nullable: true }) prenom: string | null;
  @ApiProperty() estTresorier: boolean;
  @ApiProperty() estActif: boolean;
  @ApiProperty() dateAdhesion: Date;

  static fromEntity(e: CotisationMembreEntity): MembreResponse {
    const r = new MembreResponse();
    r.id = e.id;
    r.groupeId = e.groupeId;
    r.locataireId = e.locataireId;
    r.nom = e.nom;
    r.prenom = e.prenom;
    r.estTresorier = e.estTresorier;
    r.estActif = e.estActif;
    r.dateAdhesion = e.dateAdhesion;
    return r;
  }
}

// ── Contribution ──────────────────────────────────────────────────────────────

export class ContributionResponse {
  @ApiProperty() id: string;
  @ApiProperty() montant: number;
  @ApiProperty() montantPaye: number;
  @ApiProperty() montantRestant: number;
  @ApiProperty() periode: string;
  @ApiProperty({ enum: PaymentStatus }) statut: PaymentStatus;
  @ApiPropertyOptional({ nullable: true }) datePaiement: Date | null;
  @ApiPropertyOptional({ nullable: true }) referenceId: string | null;
  @ApiPropertyOptional({ nullable: true }) recuUrl: string | null;
  @ApiProperty() groupeId: string;
  @ApiProperty() membreId: string;
  @ApiPropertyOptional({ nullable: true }) membreNom: string | null;
  @ApiPropertyOptional({ nullable: true }) membrePrenom: string | null;
  @ApiPropertyOptional({ nullable: true }) groupeNom: string | null;
  @ApiPropertyOptional({ nullable: true }) motifRejet: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(e: ContributionEntity): ContributionResponse {
    const r = new ContributionResponse();
    r.id = e.id;
    r.montant = e.montant;
    r.montantPaye = e.montantPaye;
    r.montantRestant = e.montantRestant();
    r.periode = e.periode;
    r.statut = e.statut;
    r.datePaiement = e.datePaiement;
    r.referenceId = e.referenceId;
    r.recuUrl = e.recuUrl;
    r.groupeId = e.groupeId;
    r.membreId = e.membreId;
    r.membreNom = e.membreNom;
    r.membrePrenom = e.membrePrenom;
    r.groupeNom = e.groupeNom;
    r.motifRejet = e.motifRejet;
    r.createdAt = e.createdAt;
    r.updatedAt = e.updatedAt;
    return r;
  }
}

// ── Tranche ───────────────────────────────────────────────────────────────────

export class TranchePaiementResponse {
  @ApiProperty() id: string;
  @ApiProperty() montant: number;
  @ApiProperty() datePaiement: Date;
  @ApiPropertyOptional({ nullable: true }) referenceId: string | null;
  @ApiPropertyOptional({ nullable: true }) recuUrl: string | null;
  @ApiProperty() contributionId: string;
  @ApiProperty() createdAt: Date;

  static fromEntity(e: TranchePaiementEntity): TranchePaiementResponse {
    const r = new TranchePaiementResponse();
    r.id = e.id;
    r.montant = e.montant;
    r.datePaiement = e.datePaiement;
    r.referenceId = e.referenceId;
    r.recuUrl = e.recuUrl;
    r.contributionId = e.contributionId;
    r.createdAt = e.createdAt;
    return r;
  }
}

// ── Résultat d'ajout de tranche ───────────────────────────────────────────────

export class AddTrancheResultResponse {
  @ApiProperty({ type: TranchePaiementResponse }) tranche: TranchePaiementResponse;
  @ApiProperty({ type: ContributionResponse }) contribution: ContributionResponse;
}

// ── Résumé ────────────────────────────────────────────────────────────────────

export class GroupeSummaryResponse {
  @ApiProperty() totalAttendu: number;
  @ApiProperty() totalCollecte: number;
  @ApiProperty() totalEnAttente: number;
  @ApiProperty() nombreMembresPayes: number;
  @ApiProperty() nombreMembresEnAttente: number;
  @ApiProperty({ type: [ContributionResponse] }) contributions: ContributionResponse[];

  static fromSummary(s: GroupeSummary): GroupeSummaryResponse {
    const r = new GroupeSummaryResponse();
    r.totalAttendu = s.totalAttendu;
    r.totalCollecte = s.totalCollecte;
    r.totalEnAttente = s.totalEnAttente;
    r.nombreMembresPayes = s.nombreMembresPayes;
    r.nombreMembresEnAttente = s.nombreMembresEnAttente;
    r.contributions = s.contributions.map(ContributionResponse.fromEntity);
    return r;
  }
}

// ── Espace membre ─────────────────────────────────────────────────────────────

export class MonGroupeResponse {
  @ApiProperty({ type: GroupeResponse }) groupe: GroupeResponse;
  @ApiProperty({ type: MembreResponse }) membre: MembreResponse;
  @ApiPropertyOptional({ type: ContributionResponse, nullable: true })
  contributionCourante: ContributionResponse | null;

  static fromMonGroupe(mg: MonGroupe): MonGroupeResponse {
    const r = new MonGroupeResponse();
    r.groupe = GroupeResponse.fromEntity(mg.groupe);
    r.membre = MembreResponse.fromEntity(mg.membre);
    r.contributionCourante = mg.contributionCourante
      ? ContributionResponse.fromEntity(mg.contributionCourante)
      : null;
    return r;
  }
}

export class MonBilanResponse {
  @ApiProperty() totalAttendu: number;
  @ApiProperty() totalPaye: number;
  @ApiProperty() totalRestant: number;
  @ApiProperty({ type: [ContributionResponse] }) contributions: ContributionResponse[];

  static fromBilan(b: MonBilan): MonBilanResponse {
    const r = new MonBilanResponse();
    r.totalAttendu = b.totalAttendu;
    r.totalPaye = b.totalPaye;
    r.totalRestant = b.totalRestant;
    r.contributions = b.contributions.map(ContributionResponse.fromEntity);
    return r;
  }
}

// ── Historique périodes ───────────────────────────────────────────────────────

export class HistoriquePeriodeResponse {
  @ApiProperty() periode: string;
  @ApiProperty() totalAttendu: number;
  @ApiProperty() totalCollecte: number;
  @ApiProperty() totalEnAttente: number;
  @ApiProperty() nombreMembres: number;
  @ApiProperty() nombrePaye: number;
  @ApiProperty() nombrePartiel: number;
  @ApiProperty() nombreEnAttente: number;
  @ApiProperty() nombreRejete: number;

  static fromSummary(s: PeriodeSummary): HistoriquePeriodeResponse {
    const r = new HistoriquePeriodeResponse();
    r.periode = s.periode;
    r.totalAttendu = s.totalAttendu;
    r.totalCollecte = s.totalCollecte;
    r.totalEnAttente = s.totalEnAttente;
    r.nombreMembres = s.nombreMembres;
    r.nombrePaye = s.nombrePaye;
    r.nombrePartiel = s.nombrePartiel;
    r.nombreEnAttente = s.nombreEnAttente;
    r.nombreRejete = s.nombreRejete;
    return r;
  }
}
