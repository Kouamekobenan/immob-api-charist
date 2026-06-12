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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { CreateContractDto } from '../application/dtos/create-contract.dto';
import { UpdateContractDto } from '../application/dtos/update-contract.dto';
import { ContractQueryDto } from '../application/dtos/contract-query.dto';
import { TerminateContractDto } from '../application/dtos/terminate-contract.dto';
import {
  ContractResponse,
  PaginatedContractsResponse,
} from '../application/responses/contract.response';
import { CreateContractUseCase } from '../application/use-cases/create-contract.use-case';
import { GetContractUseCase } from '../application/use-cases/get-contract.use-case';
import { GetAllContractsUseCase } from '../application/use-cases/get-all-contracts.use-case';
import { UpdateContractUseCase } from '../application/use-cases/update-contract.use-case';
import { TerminateContractUseCase } from '../application/use-cases/terminate-contract.use-case';
import { DeleteContractUseCase } from '../application/use-cases/delete-contract.use-case';

@ApiTags('Contrats')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly createContractUseCase: CreateContractUseCase,
    private readonly getContractUseCase: GetContractUseCase,
    private readonly getAllContractsUseCase: GetAllContractsUseCase,
    private readonly updateContractUseCase: UpdateContractUseCase,
    private readonly terminateContractUseCase: TerminateContractUseCase,
    private readonly deleteContractUseCase: DeleteContractUseCase,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /contracts — Créer un contrat
  // ─────────────────────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Créer un nouveau contrat de bail',
    description:
      'Crée un contrat entre un locataire et un bien. Lève une erreur si le bien a déjà un contrat actif.',
  })
  @ApiResponse({ status: 201, type: ContractResponse, description: 'Contrat créé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Bien ou locataire introuvable' })
  @ApiResponse({ status: 409, description: 'Le bien possède déjà un contrat actif' })
  create(@Body() dto: CreateContractDto): Promise<ContractResponse> {
    return this.createContractUseCase.execute(dto) as Promise<ContractResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /contracts — Lister avec filtres et pagination
  // ─────────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Lister tous les contrats',
    description: 'Supporte la pagination et les filtres : locataireId, propertyId, estActif.',
  })
  @ApiResponse({ status: 200, type: PaginatedContractsResponse })
  findAll(@Query() query: ContractQueryDto): Promise<PaginatedContractsResponse> {
    return this.getAllContractsUseCase.execute(query) as Promise<PaginatedContractsResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /contracts/:id — Détail d'un contrat
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un contrat par son identifiant' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ContractResponse })
  @ApiResponse({ status: 404, description: 'Contrat introuvable' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContractResponse> {
    return this.getContractUseCase.execute(id) as Promise<ContractResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /contracts/property/:propertyId — Contrats d'un bien
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Lister les contrats d\'un bien immobilier' })
  @ApiParam({ name: 'propertyId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedContractsResponse })
  findByProperty(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query() query: ContractQueryDto,
  ): Promise<PaginatedContractsResponse> {
    return this.getAllContractsUseCase.execute({
      ...query,
      propertyId,
    }) as Promise<PaginatedContractsResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /contracts/locataire/:locataireId — Contrats d'un locataire
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('locataire/:locataireId')
  @ApiOperation({ summary: 'Lister les contrats d\'un locataire' })
  @ApiParam({ name: 'locataireId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedContractsResponse })
  findByLocataire(
    @Param('locataireId', ParseUUIDPipe) locataireId: string,
    @Query() query: ContractQueryDto,
  ): Promise<PaginatedContractsResponse> {
    return this.getAllContractsUseCase.execute({
      ...query,
      locataireId,
    }) as Promise<PaginatedContractsResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /contracts/:id — Modifier un contrat
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier les informations d\'un contrat actif',
    description: 'Seuls les contrats actifs peuvent être modifiés. Les champs propertyId et locataireId sont immuables.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ContractResponse })
  @ApiResponse({ status: 400, description: 'Contrat déjà résilié ou dates incohérentes' })
  @ApiResponse({ status: 404, description: 'Contrat introuvable' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContractDto,
  ): Promise<ContractResponse> {
    return this.updateContractUseCase.execute(id, dto) as Promise<ContractResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /contracts/:id/terminate — Résilier un contrat
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/terminate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Résilier un contrat de bail',
    description:
      'Marque le contrat comme inactif, enregistre la date de résiliation et libère le bien (estOccupe = false).',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ContractResponse, description: 'Contrat résilié' })
  @ApiResponse({ status: 400, description: 'Contrat déjà résilié ou date invalide' })
  @ApiResponse({ status: 404, description: 'Contrat introuvable' })
  terminate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TerminateContractDto,
  ): Promise<ContractResponse> {
    return this.terminateContractUseCase.execute(id, dto.dateFin) as Promise<ContractResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /contracts/:id — Supprimer un contrat résilié
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer définitivement un contrat résilié',
    description: 'Seuls les contrats inactifs (résiliés) peuvent être supprimés.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Contrat supprimé' })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer un contrat actif' })
  @ApiResponse({ status: 404, description: 'Contrat introuvable' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteContractUseCase.execute(id);
  }
}
