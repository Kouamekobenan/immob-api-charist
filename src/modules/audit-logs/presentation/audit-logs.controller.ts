import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { CreateAuditLogDto } from '../application/dtos/create-audit-log.dto';
import { AuditLogQueryDto } from '../application/dtos/audit-log-query.dto';
import {
  AuditLogResponse,
  PaginatedAuditLogsResponse,
} from '../application/responses/audit-log.response';
import { CreateAuditLogUseCase } from '../application/use-cases/create-audit-log.use-case';
import { GetAuditLogUseCase } from '../application/use-cases/get-audit-log.use-case';
import { GetAllAuditLogsUseCase } from '../application/use-cases/get-all-audit-logs.use-case';

@ApiTags("Journal d'audit")
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(
    private readonly createAuditLogUseCase: CreateAuditLogUseCase,
    private readonly getAuditLogUseCase: GetAuditLogUseCase,
    private readonly getAllAuditLogsUseCase: GetAllAuditLogsUseCase,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /audit-logs — Enregistrer une action (usage interne ou admin)
  // ─────────────────────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Enregistrer une entrée dans le journal d'audit",
    description:
      "Utilisé en interne par les autres modules (status ticket, paiement reçu…). Peut aussi être appelé manuellement par un admin.",
  })
  @ApiResponse({ status: 201, type: AuditLogResponse })
  async create(@Body() dto: CreateAuditLogDto): Promise<AuditLogResponse> {
    const entity = await this.createAuditLogUseCase.execute(dto);
    return AuditLogResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /audit-logs — Lister avec filtres
  // ─────────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: "Lister les entrées du journal d'audit",
    description:
      'Filtres : action (contient), table, enregistrementId, userId, dateDebut, dateFin. Triés par date décroissante.',
  })
  @ApiResponse({ status: 200, type: PaginatedAuditLogsResponse })
  async findAll(@Query() query: AuditLogQueryDto): Promise<PaginatedAuditLogsResponse> {
    const result = await this.getAllAuditLogsUseCase.execute(query);
    return {
      data: result.data.map(AuditLogResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /audit-logs/user/:userId — Logs d'un utilisateur
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('user/:userId')
  @ApiOperation({ summary: "Historique des actions d'un utilisateur" })
  @ApiParam({ name: 'userId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedAuditLogsResponse })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: AuditLogQueryDto,
  ): Promise<PaginatedAuditLogsResponse> {
    const result = await this.getAllAuditLogsUseCase.execute({ ...query, userId });
    return {
      data: result.data.map(AuditLogResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /audit-logs/record/:table/:enregistrementId — Timeline d'un enregistrement
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('record/:table/:enregistrementId')
  @ApiOperation({
    summary: "Historique complet d'un enregistrement",
    description:
      "Retourne toutes les actions effectuées sur un enregistrement précis (ex: table='Ticket', enregistrementId='uuid'). Utile pour l'audit trail.",
  })
  @ApiParam({ name: 'table', type: String, example: 'Ticket' })
  @ApiParam({ name: 'enregistrementId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedAuditLogsResponse })
  async findByRecord(
    @Param('table') table: string,
    @Param('enregistrementId', ParseUUIDPipe) enregistrementId: string,
    @Query() query: AuditLogQueryDto,
  ): Promise<PaginatedAuditLogsResponse> {
    const result = await this.getAllAuditLogsUseCase.execute({
      ...query,
      table,
      enregistrementId,
    });
    return {
      data: result.data.map(AuditLogResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /audit-logs/:id — Détail d'une entrée
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: "Récupérer une entrée du journal par son identifiant" })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: AuditLogResponse })
  @ApiResponse({ status: 404, description: 'Entrée introuvable' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AuditLogResponse> {
    const entity = await this.getAuditLogUseCase.execute(id);
    return AuditLogResponse.fromEntity(entity);
  }
}
