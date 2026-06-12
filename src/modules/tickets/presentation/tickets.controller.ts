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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { CreateTicketDto } from '../application/dtos/create-ticket.dto';
import { AssignTicketDto } from '../application/dtos/assign-ticket.dto';
import { UpdateTicketStatusDto } from '../application/dtos/update-ticket-status.dto';
import { TicketQueryDto } from '../application/dtos/ticket-query.dto';
import {
  PaginatedTicketsResponse,
  TicketResponse,
} from '../application/responses/ticket.response';
import { CreateTicketUseCase } from '../application/use-cases/create-ticket.use-case';
import { GetTicketUseCase } from '../application/use-cases/get-ticket.use-case';
import { GetAllTicketsUseCase } from '../application/use-cases/get-all-tickets.use-case';
import { AssignTicketUseCase } from '../application/use-cases/assign-ticket.use-case';
import { UpdateTicketStatusUseCase } from '../application/use-cases/update-ticket-status.use-case';
import { AddPhotosUseCase } from '../application/use-cases/add-photos.use-case';
import { DeleteTicketUseCase } from '../application/use-cases/delete-ticket.use-case';

@ApiTags('Tickets de maintenance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly getTicketUseCase: GetTicketUseCase,
    private readonly getAllTicketsUseCase: GetAllTicketsUseCase,
    private readonly assignTicketUseCase: AssignTicketUseCase,
    private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase,
    private readonly addPhotosUseCase: AddPhotosUseCase,
    private readonly deleteTicketUseCase: DeleteTicketUseCase,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tickets — Créer un ticket (avec photos optionnelles)
  // ─────────────────────────────────────────────────────────────────────────────
  @Post()
  @UseInterceptors(FilesInterceptor('photos', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Signaler une panne ou un problème',
    description: 'Crée un ticket OUVERT. Accepte jusqu\'à 5 photos (multipart/form-data). Les photos sont uploadées sur Cloudinary.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['titre', 'description', 'propertyId', 'locataireId'],
      properties: {
        titre: { type: 'string', example: 'Fuite d\'eau dans la cuisine' },
        description: { type: 'string', example: 'Le robinet fuit depuis 2 jours.' },
        urgence: { type: 'string', enum: ['FAIBLE', 'MOYEN', 'CRITIQUE'], default: 'MOYEN' },
        propertyId: { type: 'string', format: 'uuid' },
        locataireId: { type: 'string', format: 'uuid' },
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: '5 photos maximum (jpg/png/webp)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: TicketResponse })
  @ApiResponse({ status: 404, description: 'Bien ou locataire introuvable' })
  @ApiResponse({ status: 422, description: 'Rôle locataire invalide' })
  async create(
    @Body() dto: CreateTicketDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<TicketResponse> {
    const entity = await this.createTicketUseCase.execute(dto, files ?? []);
    return TicketResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tickets — Lister avec filtres
  // ─────────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Lister les tickets',
    description: 'Filtres : propertyId, locataireId, prestataireId, statut, urgence. Triés par urgence DESC puis date DESC.',
  })
  @ApiResponse({ status: 200, type: PaginatedTicketsResponse })
  async findAll(@Query() query: TicketQueryDto): Promise<PaginatedTicketsResponse> {
    const result = await this.getAllTicketsUseCase.execute(query);
    return {
      data: result.data.map(TicketResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tickets/property/:propertyId — Tickets d'un bien
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Lister les tickets d\'un bien immobilier' })
  @ApiParam({ name: 'propertyId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedTicketsResponse })
  async findByProperty(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query() query: TicketQueryDto,
  ): Promise<PaginatedTicketsResponse> {
    const result = await this.getAllTicketsUseCase.execute({ ...query, propertyId });
    return {
      data: result.data.map(TicketResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tickets/locataire/:locataireId — Tickets signalés par un locataire
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('locataire/:locataireId')
  @ApiOperation({ summary: 'Lister les tickets signalés par un locataire' })
  @ApiParam({ name: 'locataireId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedTicketsResponse })
  async findByLocataire(
    @Param('locataireId', ParseUUIDPipe) locataireId: string,
    @Query() query: TicketQueryDto,
  ): Promise<PaginatedTicketsResponse> {
    const result = await this.getAllTicketsUseCase.execute({ ...query, locataireId });
    return {
      data: result.data.map(TicketResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tickets/prestataire/:prestataireId — Tickets assignés à un prestataire
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('prestataire/:prestataireId')
  @ApiOperation({ summary: 'Lister les tickets assignés à un prestataire' })
  @ApiParam({ name: 'prestataireId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedTicketsResponse })
  async findByPrestataire(
    @Param('prestataireId', ParseUUIDPipe) prestataireId: string,
    @Query() query: TicketQueryDto,
  ): Promise<PaginatedTicketsResponse> {
    const result = await this.getAllTicketsUseCase.execute({ ...query, prestataireId });
    return {
      data: result.data.map(TicketResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tickets/:id — Détail d'un ticket
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un ticket par son identifiant' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: TicketResponse })
  @ApiResponse({ status: 404, description: 'Ticket introuvable' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TicketResponse> {
    const entity = await this.getTicketUseCase.execute(id);
    return TicketResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /tickets/:id/assign — Assigner un prestataire
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assigner un prestataire à un ticket',
    description: 'Passe le statut à ASSIGNE. L\'utilisateur cible doit avoir le rôle PRESTATAIRE.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: TicketResponse })
  @ApiResponse({ status: 404, description: 'Ticket ou prestataire introuvable' })
  @ApiResponse({ status: 422, description: 'Transition de statut non autorisée ou rôle invalide' })
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTicketDto,
  ): Promise<TicketResponse> {
    const entity = await this.assignTicketUseCase.execute(id, dto);
    return TicketResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /tickets/:id/status — Changer le statut
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Changer le statut d\'un ticket',
    description: `Machine à états :
      OUVERT → ASSIGNE, CLOTURE
      ASSIGNE → EN_COURS, OUVERT, CLOTURE
      EN_COURS → RESOLU, CLOTURE
      RESOLU → CLOTURE`,
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: TicketResponse })
  @ApiResponse({ status: 404, description: 'Ticket introuvable' })
  @ApiResponse({ status: 422, description: 'Transition non autorisée' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketStatusDto,
  ): Promise<TicketResponse> {
    const entity = await this.updateTicketStatusUseCase.execute(id, dto);
    return TicketResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tickets/:id/photos — Ajouter des photos
  // ─────────────────────────────────────────────────────────────────────────────
  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('photos', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Ajouter des photos à un ticket existant',
    description: 'Upload jusqu\'à 5 photos supplémentaires sur Cloudinary. Impossible si le ticket est CLOTURE.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photos'],
      properties: {
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: '5 photos maximum (jpg/png/webp)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: TicketResponse })
  @ApiResponse({ status: 400, description: 'Ticket clôturé ou aucun fichier' })
  @ApiResponse({ status: 404, description: 'Ticket introuvable' })
  async addPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<TicketResponse> {
    const entity = await this.addPhotosUseCase.execute(id, files ?? []);
    return TicketResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /tickets/:id — Supprimer un ticket
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un ticket',
    description: 'Uniquement autorisé pour les tickets au statut OUVERT.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Ticket supprimé' })
  @ApiResponse({ status: 400, description: 'Ticket déjà traité (non OUVERT)' })
  @ApiResponse({ status: 404, description: 'Ticket introuvable' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteTicketUseCase.execute(id);
  }
}
