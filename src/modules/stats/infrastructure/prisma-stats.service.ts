import { Injectable } from '@nestjs/common';
import {
  ExpenseStatus,
  PaymentStatus,
  Role,
  TicketStatus,
  UrgencyLevel,
} from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class PrismaStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const currentPeriode = this.toPeriode(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      loyersAttendusData,
      loyersEncaissesData,
      depensesData,
      totalBiens,
      biensLoues,
      contratsActifs,
      totalLocataires,
      ticketsOuverts,
      ticketsUrgents,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { periode: currentPeriode },
        _sum: { montant: true },
      }),
      this.prisma.payment.aggregate({
        where: { periode: currentPeriode, statut: PaymentStatus.PAYE },
        _sum: { montant: true },
      }),
      this.prisma.expense.aggregate({
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
          statut: { not: ExpenseStatus.ANNULEE },
        },
        _sum: { montant: true },
      }),
      this.prisma.property.count(),
      this.prisma.property.count({ where: { estOccupe: true } }),
      this.prisma.contract.count({ where: { estActif: true } }),
      this.prisma.user.count({ where: { role: Role.LOCATAIRE } }),
      this.prisma.ticket.count({
        where: {
          statut: {
            in: [TicketStatus.OUVERT, TicketStatus.ASSIGNE, TicketStatus.EN_COURS],
          },
        },
      }),
      this.prisma.ticket.count({
        where: {
          urgence: UrgencyLevel.CRITIQUE,
          statut: { notIn: [TicketStatus.RESOLU, TicketStatus.CLOTURE] },
        },
      }),
    ]);

    const loyersAttendus = loyersAttendusData._sum.montant ?? 0;
    const loyersEncaisses = loyersEncaissesData._sum.montant ?? 0;
    const depensesDuMois = depensesData._sum.montant ?? 0;
    const biensDisponibles = totalBiens - biensLoues;

    return {
      periode: currentPeriode,
      financier: {
        loyersAttendus,
        loyersEncaisses,
        tauxRecouvrement:
          loyersAttendus > 0
            ? Math.round((loyersEncaisses / loyersAttendus) * 1000) / 10
            : 0,
        depensesDuMois,
        soldeNet: loyersEncaisses - depensesDuMois,
      },
      patrimoine: {
        totalBiens,
        biensLoues,
        biensDisponibles,
        tauxOccupation:
          totalBiens > 0
            ? Math.round((biensLoues / totalBiens) * 1000) / 10
            : 0,
      },
      activite: {
        contratsActifs,
        totalLocataires,
        ticketsOuverts,
        ticketsUrgents,
      },
    };
  }

  async getRevenusChart(months: number) {
    const periods: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      periods.push(this.toPeriode(d));
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const [payments, expenses] = await Promise.all([
      this.prisma.payment.findMany({
        where: { periode: { in: periods }, statut: PaymentStatus.PAYE },
        select: { periode: true, montant: true },
      }),
      this.prisma.expense.findMany({
        where: {
          date: { gte: startDate },
          statut: { not: ExpenseStatus.ANNULEE },
        },
        select: { date: true, montant: true },
      }),
    ]);

    const paymentsByPeriod: Record<string, number> = {};
    for (const p of payments) {
      paymentsByPeriod[p.periode] = (paymentsByPeriod[p.periode] ?? 0) + p.montant;
    }

    const expensesByPeriod: Record<string, number> = {};
    for (const e of expenses) {
      const p = this.toPeriode(e.date);
      expensesByPeriod[p] = (expensesByPeriod[p] ?? 0) + e.montant;
    }

    return periods.map((periode) => {
      const loyersEncaisses = paymentsByPeriod[periode] ?? 0;
      const depenses = expensesByPeriod[periode] ?? 0;
      return { periode, loyersEncaisses, depenses, solde: loyersEncaisses - depenses };
    });
  }

  async getAlertes() {
    const now = new Date();
    const in60Days = new Date(now);
    in60Days.setDate(in60Days.getDate() + 60);
    const currentPeriode = this.toPeriode(now);

    const [pendingPayments, contratsExpirants, ticketsUrgents] = await Promise.all([
      this.prisma.payment.findMany({
        where: { statut: PaymentStatus.EN_ATTENTE },
        include: {
          locataire: { select: { nom: true, prenom: true } },
          contract: {
            include: { property: { select: { titre: true, adresse: true } } },
          },
        },
      }),
      this.prisma.contract.findMany({
        where: { estActif: true, dateFin: { gte: now, lte: in60Days } },
        include: {
          locataire: { select: { nom: true, prenom: true } },
          property: { select: { titre: true, adresse: true } },
        },
        orderBy: { dateFin: 'asc' },
      }),
      this.prisma.ticket.findMany({
        where: {
          urgence: UrgencyLevel.CRITIQUE,
          statut: { notIn: [TicketStatus.RESOLU, TicketStatus.CLOTURE] },
        },
        include: {
          property: { select: { titre: true } },
          locataire: { select: { nom: true, prenom: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const loyersEnRetard = pendingPayments
      .filter((p) => this.isPeriodePast(p.periode, currentPeriode))
      .map((p) => ({
        id: p.id,
        locataire: `${p.locataire.prenom} ${p.locataire.nom}`,
        bien: p.contract.property.titre,
        adresse: p.contract.property.adresse,
        montant: p.montant,
        periode: p.periode,
        joursRetard: this.joursDepuisDebutPeriode(p.periode, now),
      }))
      .sort((a, b) => b.joursRetard - a.joursRetard);

    return {
      loyersEnRetard,
      contratsExpirants: contratsExpirants.map((c) => ({
        id: c.id,
        locataire: `${c.locataire.prenom} ${c.locataire.nom}`,
        bien: c.property.titre,
        adresse: c.property.adresse,
        dateFin: c.dateFin,
        joursRestants: c.dateFin
          ? Math.ceil((c.dateFin.getTime() - now.getTime()) / 86_400_000)
          : null,
      })),
      ticketsUrgents: ticketsUrgents.map((t) => ({
        id: t.id,
        titre: t.titre,
        bien: t.property.titre,
        signalePar: `${t.locataire.prenom} ${t.locataire.nom}`,
        statut: t.statut,
        createdAt: t.createdAt,
        joursOuverts: Math.ceil((now.getTime() - t.createdAt.getTime()) / 86_400_000),
      })),
      totaux: {
        loyersEnRetard: loyersEnRetard.length,
        contratsExpirants: contratsExpirants.length,
        ticketsUrgents: ticketsUrgents.length,
      },
    };
  }

  private toPeriode(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${month}-${date.getFullYear()}`;
  }

  private isPeriodePast(periode: string, currentPeriode: string): boolean {
    const [m1, y1] = periode.split('-').map(Number);
    const [m2, y2] = currentPeriode.split('-').map(Number);
    return y1 < y2 || (y1 === y2 && m1 < m2);
  }

  private joursDepuisDebutPeriode(periode: string, now: Date): number {
    const [month, year] = periode.split('-').map(Number);
    const debut = new Date(year, month - 1, 1);
    return Math.max(0, Math.ceil((now.getTime() - debut.getTime()) / 86_400_000));
  }
}
