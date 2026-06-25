import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { CreateGroupeDto } from '../application/dtos/create-groupe.dto';
import { UpdateGroupeDto } from '../application/dtos/update-groupe.dto';
import { AddMembreDto } from '../application/dtos/add-membre.dto';
import { ConfirmContributionDto } from '../application/dtos/confirm-contribution.dto';
import { GenererContributionsDto } from '../application/dtos/generer-contributions.dto';
import { AddTrancheDto } from '../application/dtos/add-tranche.dto';
import {
  AddTrancheResultResponse,
  ContributionResponse,
  GroupeResponse,
  GroupeSummaryResponse,
  MembreResponse,
  MonBilanResponse,
  MonGroupeResponse,
  TranchePaiementResponse,
} from '../application/responses/cotisation.response';

import { CreateGroupeUseCase } from '../application/use-cases/create-groupe.use-case';
import { GetGroupeUseCase } from '../application/use-cases/get-groupe.use-case';
import { GetAllGroupesUseCase } from '../application/use-cases/get-all-groupes.use-case';
import { UpdateGroupeUseCase } from '../application/use-cases/update-groupe.use-case';
import { AddMembreUseCase } from '../application/use-cases/add-membre.use-case';
import { RemoveMembreUseCase } from '../application/use-cases/remove-membre.use-case';
import { SetTresorierUseCase } from '../application/use-cases/set-tresorier.use-case';
import { GenererContributionsUseCase } from '../application/use-cases/generer-contributions.use-case';
import { ConfirmContributionUseCase } from '../application/use-cases/confirm-contribution.use-case';
import { RejectContributionUseCase } from '../application/use-cases/reject-contribution.use-case';
import { GetGroupeSummaryUseCase } from '../application/use-cases/get-groupe-summary.use-case';
import { AddTranchePaiementUseCase } from '../application/use-cases/add-tranche-paiement.use-case';
import { GetTranchesUseCase } from '../application/use-cases/get-tranches.use-case';
import { GetMesGroupesUseCase } from '../application/use-cases/get-mes-groupes.use-case';
import { GetMesContributionsUseCase } from '../application/use-cases/get-mes-contributions.use-case';
import { PayerToutUseCase } from '../application/use-cases/payer-tout.use-case';
import { GetMembresGroupeUseCase } from '../application/use-cases/get-membres-groupe.use-case';

@ApiTags('Cotisations communes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('cotisations')
export class CotisationsController {
  constructor(
    private readonly createGroupeUseCase: CreateGroupeUseCase,
    private readonly getGroupeUseCase: GetGroupeUseCase,
    private readonly getAllGroupesUseCase: GetAllGroupesUseCase,
    private readonly updateGroupeUseCase: UpdateGroupeUseCase,
    private readonly addMembreUseCase: AddMembreUseCase,
    private readonly removeMembreUseCase: RemoveMembreUseCase,
    private readonly setTresorierUseCase: SetTresorierUseCase,
    private readonly genererContributionsUseCase: GenererContributionsUseCase,
    private readonly confirmContributionUseCase: ConfirmContributionUseCase,
    private readonly rejectContributionUseCase: RejectContributionUseCase,
    private readonly getGroupeSummaryUseCase: GetGroupeSummaryUseCase,
    private readonly addTranchePaiementUseCase: AddTranchePaiementUseCase,
    private readonly getTranchesUseCase: GetTranchesUseCase,
    private readonly getMesGroupesUseCase: GetMesGroupesUseCase,
    private readonly getMesContributionsUseCase: GetMesContributionsUseCase,
    private readonly payerToutUseCase: PayerToutUseCase,
    private readonly getMembresGroupeUseCase: GetMembresGroupeUseCase,
  ) {}

  // ── Groupes ──────────────────────────────────────────────────────────────────

  @Post('groupes')
  @ApiOperation({ summary: 'Créer un groupe de cotisation' })
  @ApiResponse({ status: 201, type: GroupeResponse })
  async createGroupe(
    @Body() dto: CreateGroupeDto,
    @Req() req: Request,
  ): Promise<GroupeResponse> {
    const createurId = (req.user as any).id;
    const entity = await this.createGroupeUseCase.execute(dto, createurId);
    return GroupeResponse.fromEntity(entity);
  }

  @Get('groupes')
  @ApiOperation({ summary: 'Lister tous les groupes de cotisation' })
  @ApiResponse({ status: 200, type: [GroupeResponse] })
  async findAllGroupes(): Promise<GroupeResponse[]> {
    const groupes = await this.getAllGroupesUseCase.execute();
    return groupes.map(GroupeResponse.fromEntity);
  }

  @Get('groupes/:id')
  @ApiOperation({ summary: 'Détail d\'un groupe de cotisation' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: GroupeResponse })
  async findGroupe(@Param('id', ParseUUIDPipe) id: string): Promise<GroupeResponse> {
    const entity = await this.getGroupeUseCase.execute(id);
    return GroupeResponse.fromEntity(entity);
  }

  @Patch('groupes/:id')
  @ApiOperation({ summary: 'Modifier un groupe (nom, montant, statut)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: GroupeResponse })
  async updateGroupe(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGroupeDto,
  ): Promise<GroupeResponse> {
    const entity = await this.updateGroupeUseCase.execute(id, dto);
    return GroupeResponse.fromEntity(entity);
  }

  // ── Résumé financier ──────────────────────────────────────────────────────────

  @Get('groupes/:id/summary')
  @ApiOperation({
    summary: 'Résumé financier du groupe pour une période',
    description: 'Retourne le total collecté, en attente, et la liste des contributions du mois.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'periode', required: false, example: '06-2026', description: 'MM-YYYY (défaut: mois courant)' })
  @ApiResponse({ status: 200, type: GroupeSummaryResponse })
  async getGroupeSummary(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('periode') periode?: string,
  ): Promise<GroupeSummaryResponse> {
    const summary = await this.getGroupeSummaryUseCase.execute(id, periode);
    return GroupeSummaryResponse.fromSummary(summary);
  }

  // ── Membres ───────────────────────────────────────────────────────────────────

  @Get('groupes/:id/membres')
  @ApiOperation({ summary: 'Lister les membres actifs d\'un groupe' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: [MembreResponse] })
  async getMembres(@Param('id', ParseUUIDPipe) id: string): Promise<MembreResponse[]> {
    const membres = await this.getMembresGroupeUseCase.execute(id);
    return membres.map(MembreResponse.fromEntity);
  }

  @Post('groupes/:id/membres')
  @ApiOperation({ summary: 'Ajouter un locataire au groupe' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 201, type: MembreResponse })
  async addMembre(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMembreDto,
  ): Promise<MembreResponse> {
    const entity = await this.addMembreUseCase.execute(id, dto);
    return MembreResponse.fromEntity(entity);
  }

  @Patch('groupes/:groupeId/membres/:membreId/tresorier')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Désigner ce membre comme trésorier du groupe' })
  @ApiParam({ name: 'groupeId', type: String, format: 'uuid' })
  @ApiParam({ name: 'membreId', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Trésorier désigné' })
  async setTresorier(
    @Param('groupeId', ParseUUIDPipe) groupeId: string,
    @Param('membreId', ParseUUIDPipe) membreId: string,
  ): Promise<void> {
    await this.setTresorierUseCase.execute(groupeId, membreId);
  }

  @Delete('groupes/:groupeId/membres/:membreId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer un membre du groupe (désactivation)' })
  @ApiParam({ name: 'groupeId', type: String, format: 'uuid' })
  @ApiParam({ name: 'membreId', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Membre retiré' })
  async removeMembre(
    @Param('groupeId', ParseUUIDPipe) groupeId: string,
    @Param('membreId', ParseUUIDPipe) membreId: string,
  ): Promise<void> {
    await this.removeMembreUseCase.execute(groupeId, membreId);
  }

  // ── Contributions ─────────────────────────────────────────────────────────────

  @Post('groupes/:id/contributions/generer')
  @ApiOperation({
    summary: 'Générer les avis de cotisation du mois',
    description:
      'Crée une contribution EN_ATTENTE pour chaque membre actif. Bloqué si déjà générées pour cette période.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 201, type: [ContributionResponse] })
  async genererContributions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenererContributionsDto,
  ): Promise<ContributionResponse[]> {
    const entities = await this.genererContributionsUseCase.execute(id, dto);
    return entities.map(ContributionResponse.fromEntity);
  }

  @Get('groupes/:id/contributions')
  @ApiOperation({ summary: 'Lister les contributions d\'un groupe' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'periode', required: false, example: '06-2026' })
  @ApiResponse({ status: 200, type: [ContributionResponse] })
  async getContributions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('periode') periode?: string,
  ): Promise<ContributionResponse[]> {
    // We reuse the summary which fetches contributions, or can call repo directly via use case
    const summary = await this.getGroupeSummaryUseCase.execute(id, periode);
    return summary.contributions.map(ContributionResponse.fromEntity);
  }

  @Patch('contributions/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmer la réception d\'une contribution (marquer PAYE)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ContributionResponse })
  async confirmContribution(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmContributionDto,
  ): Promise<ContributionResponse> {
    const entity = await this.confirmContributionUseCase.execute(id, dto);
    return ContributionResponse.fromEntity(entity);
  }

  @Patch('contributions/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeter une contribution' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ContributionResponse })
  async rejectContribution(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContributionResponse> {
    const entity = await this.rejectContributionUseCase.execute(id);
    return ContributionResponse.fromEntity(entity);
  }

  // ── Tranches de paiement ──────────────────────────────────────────────────────

  @Post('contributions/:id/tranches')
  @ApiOperation({
    summary: 'Ajouter une tranche de paiement',
    description:
      'Permet à un membre de payer sa cotisation en plusieurs fois. ' +
      'Le statut passe à PARTIEL tant que montantPaye < montant, puis PAYE automatiquement.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 201, type: AddTrancheResultResponse })
  @ApiResponse({ status: 400, description: 'Montant dépasse le reste dû' })
  @ApiResponse({ status: 422, description: 'Contribution déjà soldée ou rejetée' })
  async addTranche(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddTrancheDto,
  ): Promise<AddTrancheResultResponse> {
    const result = await this.addTranchePaiementUseCase.execute(id, dto);
    return {
      tranche: TranchePaiementResponse.fromEntity(result.tranche),
      contribution: ContributionResponse.fromEntity(result.contribution),
    };
  }

  @Get('contributions/:id/tranches')
  @ApiOperation({ summary: 'Historique des tranches d\'une contribution' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: [TranchePaiementResponse] })
  async getTranches(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TranchePaiementResponse[]> {
    const tranches = await this.getTranchesUseCase.execute(id);
    return tranches.map(TranchePaiementResponse.fromEntity);
  }

  // ── Espace membre ─────────────────────────────────────────────────────────────

  @Get('mon-espace/groupes')
  @ApiOperation({
    summary: 'Mes groupes de cotisation',
    description: 'Retourne tous les groupes auxquels le membre connecté appartient, avec sa contribution du mois courant.',
  })
  @ApiQuery({ name: 'periode', required: false, example: '06-2026', description: 'MM-YYYY (défaut: mois courant)' })
  @ApiResponse({ status: 200, type: [MonGroupeResponse] })
  async getMesGroupes(
    @Req() req: Request,
    @Query('periode') periode?: string,
  ): Promise<MonGroupeResponse[]> {
    const locataireId = (req.user as any).id;
    const result = await this.getMesGroupesUseCase.execute(locataireId, periode);
    return result.map(MonGroupeResponse.fromMonGroupe);
  }

  @Get('mon-espace/bilan')
  @ApiOperation({
    summary: 'Mon bilan de cotisations',
    description: 'Retourne toutes les contributions du membre connecté (toutes périodes, tous groupes) avec les totaux.',
  })
  @ApiQuery({ name: 'periode', required: false, example: '06-2026', description: 'Filtrer par période MM-YYYY' })
  @ApiResponse({ status: 200, type: MonBilanResponse })
  async getMesBilan(
    @Req() req: Request,
    @Query('periode') periode?: string,
  ): Promise<MonBilanResponse> {
    const locataireId = (req.user as any).id;
    const bilan = await this.getMesContributionsUseCase.execute(locataireId, periode);
    return MonBilanResponse.fromBilan(bilan);
  }

  @Post('contributions/:id/payer-tout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Payer la totalité restante d\'une contribution',
    description: 'Soldé la contribution en une seule fois. Équivalent à addTranche(montantRestant). Réservé au membre propriétaire de la contribution.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: AddTrancheResultResponse })
  @ApiResponse({ status: 403, description: 'Contribution appartenant à un autre membre' })
  @ApiResponse({ status: 422, description: 'Contribution déjà soldée ou rejetée' })
  async payerTout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmContributionDto,
    @Req() req: Request,
  ): Promise<AddTrancheResultResponse> {
    const locataireId = (req.user as any).id;
    const result = await this.payerToutUseCase.execute(id, locataireId, dto);
    return {
      tranche: TranchePaiementResponse.fromEntity(result.tranche),
      contribution: ContributionResponse.fromEntity(result.contribution),
    };
  }
}
