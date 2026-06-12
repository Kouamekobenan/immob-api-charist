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
import { CreatePropertyDto } from '../application/dtos/create-property.dto';
import { UpdatePropertyDto } from '../application/dtos/update-property.dto';
import { PropertyQueryDto } from '../application/dtos/property-query.dto';
import { AssignManagerDto } from '../application/dtos/assign-manager.dto';
import {
  PaginatedPropertiesResponse,
  PropertyResponse,
} from '../application/responses/property.response';
import { CreatePropertyUseCase } from '../application/use-cases/create-property.use-case';
import { GetPropertyUseCase } from '../application/use-cases/get-property.use-case';
import { GetAllPropertiesUseCase } from '../application/use-cases/get-all-properties.use-case';
import { UpdatePropertyUseCase } from '../application/use-cases/update-property.use-case';
import { AssignManagerUseCase } from '../application/use-cases/assign-manager.use-case';
import { RemoveManagerUseCase } from '../application/use-cases/remove-manager.use-case';
import { DeletePropertyUseCase } from '../application/use-cases/delete-property.use-case';

@ApiTags('Biens immobiliers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly createPropertyUseCase: CreatePropertyUseCase,
    private readonly getPropertyUseCase: GetPropertyUseCase,
    private readonly getAllPropertiesUseCase: GetAllPropertiesUseCase,
    private readonly updatePropertyUseCase: UpdatePropertyUseCase,
    private readonly assignManagerUseCase: AssignManagerUseCase,
    private readonly removeManagerUseCase: RemoveManagerUseCase,
    private readonly deletePropertyUseCase: DeletePropertyUseCase,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /properties — Créer un bien
  // ─────────────────────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Créer un nouveau bien immobilier',
    description: 'Vérifie que le bailleur (et le gérant éventuel) existent et ont le bon rôle.',
  })
  @ApiResponse({ status: 201, type: PropertyResponse })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Bailleur ou gérant introuvable' })
  @ApiResponse({ status: 422, description: 'Rôle utilisateur incorrect' })
  create(@Body() dto: CreatePropertyDto): Promise<PropertyResponse> {
    return this.createPropertyUseCase.execute(dto) as Promise<PropertyResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /properties — Lister avec filtres et pagination
  // ─────────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Lister les biens immobiliers',
    description:
      'Supporte la pagination et les filtres : bailleurId, gerantId, type, ville, estOccupe, search (recherche dans titre/adresse/description).',
  })
  @ApiResponse({ status: 200, type: PaginatedPropertiesResponse })
  findAll(@Query() query: PropertyQueryDto): Promise<PaginatedPropertiesResponse> {
    return this.getAllPropertiesUseCase.execute(query) as Promise<PaginatedPropertiesResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /properties/available — Biens libres uniquement
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('available')
  @ApiOperation({ summary: 'Lister uniquement les biens disponibles (non occupés)' })
  @ApiResponse({ status: 200, type: PaginatedPropertiesResponse })
  findAvailable(@Query() query: PropertyQueryDto): Promise<PaginatedPropertiesResponse> {
    return this.getAllPropertiesUseCase.execute({
      ...query,
      estOccupe: false,
    }) as Promise<PaginatedPropertiesResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /properties/occupied — Biens occupés uniquement
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('occupied')
  @ApiOperation({ summary: 'Lister uniquement les biens occupés' })
  @ApiResponse({ status: 200, type: PaginatedPropertiesResponse })
  findOccupied(@Query() query: PropertyQueryDto): Promise<PaginatedPropertiesResponse> {
    return this.getAllPropertiesUseCase.execute({
      ...query,
      estOccupe: true,
    }) as Promise<PaginatedPropertiesResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /properties/bailleur/:bailleurId — Biens d'un bailleur
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('bailleur/:bailleurId')
  @ApiOperation({ summary: 'Lister les biens d\'un bailleur (propriétaire)' })
  @ApiParam({ name: 'bailleurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedPropertiesResponse })
  findByBailleur(
    @Param('bailleurId', ParseUUIDPipe) bailleurId: string,
    @Query() query: PropertyQueryDto,
  ): Promise<PaginatedPropertiesResponse> {
    return this.getAllPropertiesUseCase.execute({
      ...query,
      bailleurId,
    }) as Promise<PaginatedPropertiesResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /properties/gerant/:gerantId — Biens gérés par un gérant
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('gerant/:gerantId')
  @ApiOperation({ summary: 'Lister les biens gérés par un gérant' })
  @ApiParam({ name: 'gerantId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedPropertiesResponse })
  findByGerant(
    @Param('gerantId', ParseUUIDPipe) gerantId: string,
    @Query() query: PropertyQueryDto,
  ): Promise<PaginatedPropertiesResponse> {
    return this.getAllPropertiesUseCase.execute({
      ...query,
      gerantId,
    }) as Promise<PaginatedPropertiesResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /properties/:id — Détail d'un bien
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un bien immobilier par son identifiant' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PropertyResponse })
  @ApiResponse({ status: 404, description: 'Bien introuvable' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PropertyResponse> {
    return this.getPropertyUseCase.execute(id) as Promise<PropertyResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /properties/:id — Modifier un bien
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier les informations d\'un bien',
    description: 'Permet de modifier : titre, description, adresse, ville, type, loyer, charges. Le bailleurId est immuable.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PropertyResponse })
  @ApiResponse({ status: 404, description: 'Bien introuvable' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
  ): Promise<PropertyResponse> {
    return this.updatePropertyUseCase.execute(id, dto) as Promise<PropertyResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /properties/:id/manager — Assigner ou changer le gérant
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assigner ou changer le gérant d\'un bien',
    description: 'Vérifie que l\'utilisateur cible a le rôle GERANT ou SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PropertyResponse })
  @ApiResponse({ status: 404, description: 'Bien ou gérant introuvable' })
  @ApiResponse({ status: 422, description: 'L\'utilisateur n\'a pas le rôle GERANT' })
  assignManager(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignManagerDto,
  ): Promise<PropertyResponse> {
    return this.assignManagerUseCase.execute(id, dto) as Promise<PropertyResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /properties/:id/manager — Retirer le gérant
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id/manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retirer le gérant d\'un bien' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PropertyResponse })
  @ApiResponse({ status: 400, description: 'Ce bien n\'a pas de gérant assigné' })
  @ApiResponse({ status: 404, description: 'Bien introuvable' })
  removeManager(@Param('id', ParseUUIDPipe) id: string): Promise<PropertyResponse> {
    return this.removeManagerUseCase.execute(id) as Promise<PropertyResponse>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /properties/:id — Supprimer un bien
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer définitivement un bien immobilier',
    description: 'Impossible si le bien possède un contrat actif.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Bien supprimé' })
  @ApiResponse({ status: 400, description: 'Bien avec contrat actif' })
  @ApiResponse({ status: 404, description: 'Bien introuvable' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deletePropertyUseCase.execute(id);
  }
}
