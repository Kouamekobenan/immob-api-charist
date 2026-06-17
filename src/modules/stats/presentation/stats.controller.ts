import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { GetDashboardStatsUseCase } from '../application/use-cases/get-dashboard-stats.use-case';
import { GetRevenusChartUseCase } from '../application/use-cases/get-revenus-chart.use-case';
import { GetAlertesUseCase } from '../application/use-cases/get-alertes.use-case';

@ApiTags('Statistiques & Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getRevenusChartUseCase: GetRevenusChartUseCase,
    private readonly getAlertesUseCase: GetAlertesUseCase,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // GET /stats/dashboard — KPIs du mois courant
  // ─────────────────────────────────────────────────────────────────────────
  @Get('dashboard')
  @ApiOperation({
    summary: 'KPIs globaux du mois courant',
    description:
      'Retourne les indicateurs financiers, patrimoniaux et d\'activité pour le mois en cours.',
  })
  getDashboard() {
    return this.getDashboardStatsUseCase.execute();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /stats/revenus?mois=12 — Graphique revenus vs dépenses
  // ─────────────────────────────────────────────────────────────────────────
  @Get('revenus')
  @ApiOperation({
    summary: 'Graphique revenus vs dépenses',
    description:
      'Données mensuelles (loyers encaissés, dépenses, solde) pour les N derniers mois. Utilisé pour construire un graphique linéaire ou barre.',
  })
  @ApiQuery({
    name: 'mois',
    required: false,
    type: Number,
    description: 'Nombre de mois à inclure (1-24, défaut: 12)',
    example: 12,
  })
  getRevenus(@Query('mois') mois?: string) {
    return this.getRevenusChartUseCase.execute(mois ? parseInt(mois, 10) : 12);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /stats/alertes — Alertes urgentes
  // ─────────────────────────────────────────────────────────────────────────
  @Get('alertes')
  @ApiOperation({
    summary: 'Alertes urgentes',
    description:
      'Loyers en retard, contrats expirant dans 60 jours, et tickets CRITIQUE non résolus.',
  })
  getAlertes() {
    return this.getAlertesUseCase.execute();
  }
}
