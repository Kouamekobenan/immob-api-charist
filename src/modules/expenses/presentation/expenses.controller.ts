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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { CreateExpenseDto } from '../application/dtos/create-expense.dto';
import { PayExpenseDto } from '../application/dtos/pay-expense.dto';
import { ExpenseQueryDto } from '../application/dtos/expense-query.dto';
import {
  ExpenseResponse,
  PaginatedExpensesResponse,
} from '../application/responses/expense.response';
import { CreateExpenseUseCase } from '../application/use-cases/create-expense.use-case';
import { GetExpenseUseCase } from '../application/use-cases/get-expense.use-case';
import { GetAllExpensesUseCase } from '../application/use-cases/get-all-expenses.use-case';
import { PayExpenseUseCase } from '../application/use-cases/pay-expense.use-case';
import { CancelExpenseUseCase } from '../application/use-cases/cancel-expense.use-case';
import { UploadJustificatifUseCase } from '../application/use-cases/upload-justificatif.use-case';
import { DeleteExpenseUseCase } from '../application/use-cases/delete-expense.use-case';

@ApiTags('Dépenses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly getExpenseUseCase: GetExpenseUseCase,
    private readonly getAllExpensesUseCase: GetAllExpensesUseCase,
    private readonly payExpenseUseCase: PayExpenseUseCase,
    private readonly cancelExpenseUseCase: CancelExpenseUseCase,
    private readonly uploadJustificatifUseCase: UploadJustificatifUseCase,
    private readonly deleteExpenseUseCase: DeleteExpenseUseCase,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /expenses — Créer une dépense
  // ─────────────────────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Créer une dépense (GERANT / BAILLEUR)',
    description:
      'Enregistre une dépense EN_ATTENTE. Peut être liée à un bien, un ticket de maintenance et/ou un bénéficiaire interne. Catégories : PRESTATAIRE, PERSONNEL, FOURNITURES, CHARGES_COMMUNES, ASSURANCE, TAXE_IMPOT, AUTRE.',
  })
  @ApiResponse({ status: 201, type: ExpenseResponse })
  @ApiResponse({ status: 404, description: 'Payeur, bien, ticket ou bénéficiaire introuvable' })
  @ApiResponse({ status: 409, description: 'Ce ticket a déjà une dépense associée' })
  @ApiResponse({ status: 422, description: 'Rôle payeur invalide (GERANT ou BAILLEUR requis)' })
  async create(@Body() dto: CreateExpenseDto): Promise<ExpenseResponse> {
    const entity = await this.createExpenseUseCase.execute(dto);
    return ExpenseResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /expenses — Lister avec filtres
  // ─────────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Lister les dépenses',
    description: 'Filtres : payeurId, propertyId, beneficiaireId, categorie, statut, dateDebut, dateFin.',
  })
  @ApiResponse({ status: 200, type: PaginatedExpensesResponse })
  async findAll(@Query() query: ExpenseQueryDto): Promise<PaginatedExpensesResponse> {
    const result = await this.getAllExpensesUseCase.execute(query);
    return {
      data: result.data.map(ExpenseResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /expenses/property/:propertyId — Dépenses d'un bien
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Lister les dépenses d\'un bien immobilier' })
  @ApiParam({ name: 'propertyId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedExpensesResponse })
  async findByProperty(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query() query: ExpenseQueryDto,
  ): Promise<PaginatedExpensesResponse> {
    const result = await this.getAllExpensesUseCase.execute({ ...query, propertyId });
    return {
      data: result.data.map(ExpenseResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /expenses/payeur/:payeurId — Dépenses initiées par un gérant/bailleur
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('payeur/:payeurId')
  @ApiOperation({ summary: 'Lister les dépenses initiées par un gérant ou bailleur' })
  @ApiParam({ name: 'payeurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedExpensesResponse })
  async findByPayeur(
    @Param('payeurId', ParseUUIDPipe) payeurId: string,
    @Query() query: ExpenseQueryDto,
  ): Promise<PaginatedExpensesResponse> {
    const result = await this.getAllExpensesUseCase.execute({ ...query, payeurId });
    return {
      data: result.data.map(ExpenseResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /expenses/beneficiaire/:beneficiaireId — Paiements reçus par un prestataire
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('beneficiaire/:beneficiaireId')
  @ApiOperation({ summary: 'Lister les paiements reçus par un prestataire/utilisateur' })
  @ApiParam({ name: 'beneficiaireId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedExpensesResponse })
  async findByBeneficiaire(
    @Param('beneficiaireId', ParseUUIDPipe) beneficiaireId: string,
    @Query() query: ExpenseQueryDto,
  ): Promise<PaginatedExpensesResponse> {
    const result = await this.getAllExpensesUseCase.execute({ ...query, beneficiaireId });
    return {
      data: result.data.map(ExpenseResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /expenses/:id — Détail d'une dépense
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une dépense par son identifiant' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ExpenseResponse })
  @ApiResponse({ status: 404, description: 'Dépense introuvable' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ExpenseResponse> {
    const entity = await this.getExpenseUseCase.execute(id);
    return ExpenseResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /expenses/:id/pay — Confirmer le paiement
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmer le paiement d\'une dépense',
    description: 'Passe le statut à PAYEE. Enregistre la référence (virement, chèque, mobile money) et le justificatif si disponibles.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ExpenseResponse })
  @ApiResponse({ status: 404, description: 'Dépense introuvable' })
  @ApiResponse({ status: 422, description: 'Dépense déjà traitée' })
  async pay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PayExpenseDto,
  ): Promise<ExpenseResponse> {
    const entity = await this.payExpenseUseCase.execute(id, dto);
    return ExpenseResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /expenses/:id/cancel — Annuler une dépense
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Annuler une dépense',
    description: 'Possible uniquement depuis le statut EN_ATTENTE.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ExpenseResponse })
  @ApiResponse({ status: 422, description: 'Dépense déjà payée ou annulée' })
  async cancel(@Param('id', ParseUUIDPipe) id: string): Promise<ExpenseResponse> {
    const entity = await this.cancelExpenseUseCase.execute(id);
    return ExpenseResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /expenses/:id/justificatif — Uploader un justificatif
  // ─────────────────────────────────────────────────────────────────────────────
  @Post(':id/justificatif')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Uploader un justificatif (facture, reçu)',
    description: 'Charge une photo ou scan de facture sur Cloudinary et l\'associe à la dépense.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Photo ou scan de la facture (jpg/png/pdf)' },
      },
    },
  })
  @ApiResponse({ status: 201, type: ExpenseResponse })
  @ApiResponse({ status: 400, description: 'Aucun fichier fourni' })
  @ApiResponse({ status: 404, description: 'Dépense introuvable' })
  async uploadJustificatif(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ExpenseResponse> {
    const entity = await this.uploadJustificatifUseCase.execute(id, file);
    return ExpenseResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /expenses/:id — Supprimer une dépense
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une dépense',
    description: 'Autorisé uniquement pour les dépenses EN_ATTENTE ou ANNULEE.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Dépense supprimée' })
  @ApiResponse({ status: 400, description: 'Dépense déjà payée — suppression impossible' })
  @ApiResponse({ status: 404, description: 'Dépense introuvable' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteExpenseUseCase.execute(id);
  }
}
