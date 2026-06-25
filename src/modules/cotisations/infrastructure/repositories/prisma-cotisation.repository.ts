import { Injectable } from '@nestjs/common';
import { CotisationStatut, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  AddMembreData,
  AddTrancheData,
  AddTrancheResult,
  ConfirmContributionData,
  CreateGroupeData,
  GroupeSummary,
  ICotisationRepository,
  UpdateGroupeData,
} from '../../domain/repositories/i-cotisation.repository';
import { CotisationGroupeEntity } from '../../domain/entities/cotisation-groupe.entity';
import { CotisationMembreEntity } from '../../domain/entities/cotisation-membre.entity';
import { ContributionEntity } from '../../domain/entities/contribution.entity';
import { TranchePaiementEntity } from '../../domain/entities/tranche-paiement.entity';

@Injectable()
export class PrismaCotisationRepository implements ICotisationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private toGroupeEntity(g: {
    id: string; nom: string; description: string | null; montantParMembre: number;
    statut: CotisationStatut; propertyId: string | null; createurId: string;
    createdAt: Date; updatedAt: Date;
  }): CotisationGroupeEntity {
    return new CotisationGroupeEntity(
      g.id, g.nom, g.description, g.montantParMembre, g.statut,
      g.propertyId, g.createurId, g.createdAt, g.updatedAt,
    );
  }

  private toMembreEntity(m: {
    id: string; groupeId: string; locataireId: string;
    estTresorier: boolean; estActif: boolean; dateAdhesion: Date;
    locataire?: { nom: string; prenom: string } | null;
  }): CotisationMembreEntity {
    return new CotisationMembreEntity(
      m.id, m.groupeId, m.locataireId, m.estTresorier, m.estActif, m.dateAdhesion,
      m.locataire?.nom ?? null,
      m.locataire?.prenom ?? null,
    );
  }

  private toContributionEntity(
    c: {
      id: string; montant: number; montantPaye: number; periode: string;
      statut: PaymentStatus; datePaiement: Date | null; referenceId: string | null;
      recuUrl: string | null; groupeId: string; membreId: string;
      createdAt: Date; updatedAt: Date;
      membre?: {
        locataire?: { nom: string; prenom: string } | null;
        groupe?: { nom: string } | null;
      } | null;
    },
  ): ContributionEntity {
    return new ContributionEntity(
      c.id, c.montant, c.montantPaye, c.periode, c.statut,
      c.datePaiement, c.referenceId, c.recuUrl,
      c.groupeId, c.membreId, c.createdAt, c.updatedAt,
      c.membre?.locataire?.nom ?? null,
      c.membre?.locataire?.prenom ?? null,
      c.membre?.groupe?.nom ?? null,
    );
  }

  private toTrancheEntity(t: {
    id: string; montant: number; datePaiement: Date;
    referenceId: string | null; recuUrl: string | null;
    contributionId: string; createdAt: Date;
  }): TranchePaiementEntity {
    return new TranchePaiementEntity(
      t.id, t.montant, t.datePaiement, t.referenceId, t.recuUrl,
      t.contributionId, t.createdAt,
    );
  }

  // ── Groupe ───────────────────────────────────────────────────────────────────

  async createGroupe(data: CreateGroupeData): Promise<CotisationGroupeEntity> {
    const g = await this.prisma.cotisationGroupe.create({
      data: {
        nom: data.nom,
        description: data.description,
        montantParMembre: data.montantParMembre,
        propertyId: data.propertyId,
        createurId: data.createurId,
      },
    });
    return this.toGroupeEntity(g);
  }

  async findGroupeById(id: string): Promise<CotisationGroupeEntity | null> {
    const g = await this.prisma.cotisationGroupe.findUnique({ where: { id } });
    return g ? this.toGroupeEntity(g) : null;
  }

  async findAllGroupes(createurId?: string): Promise<CotisationGroupeEntity[]> {
    const groupes = await this.prisma.cotisationGroupe.findMany({
      where: createurId ? { createurId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return groupes.map((g) => this.toGroupeEntity(g));
  }

  async updateGroupe(id: string, data: UpdateGroupeData): Promise<CotisationGroupeEntity> {
    const g = await this.prisma.cotisationGroupe.update({
      where: { id },
      data: {
        ...(data.nom !== undefined && { nom: data.nom }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.montantParMembre !== undefined && { montantParMembre: data.montantParMembre }),
        ...(data.statut !== undefined && { statut: data.statut }),
      },
    });
    return this.toGroupeEntity(g);
  }

  // ── Membres ──────────────────────────────────────────────────────────────────

  async addMembre(data: AddMembreData): Promise<CotisationMembreEntity> {
    const m = await this.prisma.cotisationMembre.create({
      data: { groupeId: data.groupeId, locataireId: data.locataireId },
    });
    return this.toMembreEntity(m);
  }

  async findMembre(groupeId: string, locataireId: string): Promise<CotisationMembreEntity | null> {
    const m = await this.prisma.cotisationMembre.findUnique({
      where: { groupeId_locataireId: { groupeId, locataireId } },
    });
    return m ? this.toMembreEntity(m) : null;
  }

  async findMembreById(membreId: string): Promise<CotisationMembreEntity | null> {
    const m = await this.prisma.cotisationMembre.findUnique({ where: { id: membreId } });
    return m ? this.toMembreEntity(m) : null;
  }

  async findMembresActifs(groupeId: string): Promise<CotisationMembreEntity[]> {
    const membres = await this.prisma.cotisationMembre.findMany({
      where: { groupeId, estActif: true },
      include: { locataire: true },
      orderBy: { dateAdhesion: 'asc' },
    });
    return membres.map((m) => this.toMembreEntity(m));
  }

  async findMembresByLocataire(locataireId: string): Promise<CotisationMembreEntity[]> {
    const membres = await this.prisma.cotisationMembre.findMany({
      where: { locataireId, estActif: true },
      orderBy: { dateAdhesion: 'desc' },
    });
    return membres.map((m) => this.toMembreEntity(m));
  }

  async setTresorier(groupeId: string, membreId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.cotisationMembre.updateMany({
        where: { groupeId },
        data: { estTresorier: false },
      }),
      this.prisma.cotisationMembre.update({
        where: { id: membreId },
        data: { estTresorier: true },
      }),
    ]);
  }

  async removeMembre(membreId: string): Promise<void> {
    await this.prisma.cotisationMembre.update({
      where: { id: membreId },
      data: { estActif: false },
    });
  }

  // ── Contributions ─────────────────────────────────────────────────────────────

  async createContribution(data: {
    groupeId: string; membreId: string; montant: number; periode: string;
  }): Promise<ContributionEntity> {
    const c = await this.prisma.contribution.create({ data });
    return this.toContributionEntity(c);
  }

  async findContribution(
    groupeId: string, membreId: string, periode: string,
  ): Promise<ContributionEntity | null> {
    const c = await this.prisma.contribution.findUnique({
      where: { groupeId_membreId_periode: { groupeId, membreId, periode } },
    });
    return c ? this.toContributionEntity(c) : null;
  }

  async findContributionById(id: string): Promise<ContributionEntity | null> {
    const c = await this.prisma.contribution.findUnique({ where: { id } });
    return c ? this.toContributionEntity(c) : null;
  }

  async findContributionsByGroupe(
    groupeId: string, periode?: string,
  ): Promise<ContributionEntity[]> {
    const contributions = await this.prisma.contribution.findMany({
      where: { groupeId, ...(periode && { periode }) },
      orderBy: { createdAt: 'desc' },
      include: { membre: { include: { locataire: true } } },
    });
    return contributions.map((c) => this.toContributionEntity(c));
  }

  async findContributionsByMembre(membreId: string): Promise<ContributionEntity[]> {
    const contributions = await this.prisma.contribution.findMany({
      where: { membreId },
      orderBy: { createdAt: 'desc' },
      include: { membre: { include: { locataire: true, groupe: true } } },
    });
    return contributions.map((c) => this.toContributionEntity(c));
  }

  async updateContributionStatut(
    id: string, statut: PaymentStatus, data?: ConfirmContributionData,
  ): Promise<ContributionEntity> {
    const current = await this.prisma.contribution.findUniqueOrThrow({ where: { id } });
    const c = await this.prisma.contribution.update({
      where: { id },
      data: {
        statut,
        ...(statut === PaymentStatus.PAYE && {
          montantPaye: current.montant,
          datePaiement: data?.datePaiement ?? new Date(),
        }),
        ...(data?.referenceId !== undefined && { referenceId: data.referenceId }),
        ...(data?.recuUrl !== undefined && { recuUrl: data.recuUrl }),
      },
    });
    return this.toContributionEntity(c);
  }

  // ── Tranches ──────────────────────────────────────────────────────────────────

  async addTranche(contributionId: string, data: AddTrancheData): Promise<AddTrancheResult> {
    const current = await this.prisma.contribution.findUniqueOrThrow({
      where: { id: contributionId },
    });

    const newMontantPaye = current.montantPaye + data.montant;
    const isFullyPaid = newMontantPaye >= current.montant;
    const newStatut = isFullyPaid ? PaymentStatus.PAYE : PaymentStatus.PARTIEL;

    const [tranche, contribution] = await this.prisma.$transaction([
      this.prisma.tranchePaiement.create({
        data: {
          montant: data.montant,
          datePaiement: data.datePaiement ?? new Date(),
          referenceId: data.referenceId,
          recuUrl: data.recuUrl,
          contributionId,
        },
      }),
      this.prisma.contribution.update({
        where: { id: contributionId },
        data: {
          montantPaye: newMontantPaye,
          statut: newStatut,
          ...(isFullyPaid && { datePaiement: data.datePaiement ?? new Date() }),
        },
      }),
    ]);

    return {
      tranche: this.toTrancheEntity(tranche),
      contribution: this.toContributionEntity(contribution),
    };
  }

  async findTranchesByContribution(contributionId: string): Promise<TranchePaiementEntity[]> {
    const tranches = await this.prisma.tranchePaiement.findMany({
      where: { contributionId },
      orderBy: { datePaiement: 'asc' },
    });
    return tranches.map((t) => this.toTrancheEntity(t));
  }

  // ── Résumé ────────────────────────────────────────────────────────────────────

  async getGroupeSummary(groupeId: string, periode: string): Promise<GroupeSummary> {
    const contributions = await this.prisma.contribution.findMany({
      where: { groupeId, periode },
      include: { membre: { include: { locataire: true } } },
    });

    const entities = contributions.map((c) => this.toContributionEntity(c));
    const payes = entities.filter((c) => c.statut === PaymentStatus.PAYE);
    const enAttente = entities.filter(
      (c) => c.statut === PaymentStatus.EN_ATTENTE || c.statut === PaymentStatus.PARTIEL,
    );

    return {
      totalAttendu: entities.reduce((sum, c) => sum + c.montant, 0),
      // Utilise montantPaye pour capturer les paiements partiels aussi
      totalCollecte: entities.reduce((sum, c) => sum + c.montantPaye, 0),
      totalEnAttente: enAttente.reduce((sum, c) => sum + c.montantRestant(), 0),
      nombreMembresPayes: payes.length,
      nombreMembresEnAttente: enAttente.length,
      contributions: entities,
    };
  }
}
