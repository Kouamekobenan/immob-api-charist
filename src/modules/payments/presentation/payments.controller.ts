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
import { CreatePaymentDto } from '../application/dtos/create-payment.dto';
import { ConfirmPaymentDto } from '../application/dtos/confirm-payment.dto';
import { PaymentQueryDto } from '../application/dtos/payment-query.dto';
import {
  PaginatedPaymentsResponse,
  PaymentResponse,
} from '../application/responses/payment.response';
import { CreatePaymentUseCase } from '../application/use-cases/create-payment.use-case';
import { GetPaymentUseCase } from '../application/use-cases/get-payment.use-case';
import { GetAllPaymentsUseCase } from '../application/use-cases/get-all-payments.use-case';
import { ConfirmPaymentUseCase } from '../application/use-cases/confirm-payment.use-case';
import { RejectPaymentUseCase } from '../application/use-cases/reject-payment.use-case';
import { MarkPaymentFailedUseCase } from '../application/use-cases/mark-payment-failed.use-case';
import { DeletePaymentUseCase } from '../application/use-cases/delete-payment.use-case';

@ApiTags('Paiements')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly getAllPaymentsUseCase: GetAllPaymentsUseCase,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
    private readonly rejectPaymentUseCase: RejectPaymentUseCase,
    private readonly markPaymentFailedUseCase: MarkPaymentFailedUseCase,
    private readonly deletePaymentUseCase: DeletePaymentUseCase,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /payments — Créer un avis de paiement
  // ─────────────────────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Créer un avis de paiement (loyer)',
    description:
      'Génère un paiement EN_ATTENTE pour une période donnée. Bloqué si un paiement existe déjà pour la même période sur ce contrat.',
  })
  @ApiResponse({ status: 201, type: PaymentResponse })
  @ApiResponse({ status: 404, description: 'Contrat introuvable' })
  @ApiResponse({ status: 409, description: 'Paiement déjà existant pour cette période' })
  @ApiResponse({ status: 422, description: 'Contrat résilié ou locataire non concordant' })
  async create(@Body() dto: CreatePaymentDto): Promise<PaymentResponse> {
    const entity = await this.createPaymentUseCase.execute(dto);
    return PaymentResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /payments — Lister avec filtres et pagination
  // ─────────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Lister les paiements',
    description: 'Filtres disponibles : contractId, locataireId, statut, periode (MM-YYYY).',
  })
  @ApiResponse({ status: 200, type: PaginatedPaymentsResponse })
  async findAll(@Query() query: PaymentQueryDto): Promise<PaginatedPaymentsResponse> {
    const result = await this.getAllPaymentsUseCase.execute(query);
    return {
      data: result.data.map(PaymentResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /payments/contract/:contractId — Paiements d'un contrat
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('contract/:contractId')
  @ApiOperation({ summary: 'Historique des paiements d\'un contrat' })
  @ApiParam({ name: 'contractId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedPaymentsResponse })
  async findByContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Query() query: PaymentQueryDto,
  ): Promise<PaginatedPaymentsResponse> {
    const result = await this.getAllPaymentsUseCase.execute({ ...query, contractId });
    return {
      data: result.data.map(PaymentResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /payments/locataire/:locataireId — Historique d'un locataire
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('locataire/:locataireId')
  @ApiOperation({ summary: 'Historique des paiements d\'un locataire' })
  @ApiParam({ name: 'locataireId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaginatedPaymentsResponse })
  async findByLocataire(
    @Param('locataireId', ParseUUIDPipe) locataireId: string,
    @Query() query: PaymentQueryDto,
  ): Promise<PaginatedPaymentsResponse> {
    const result = await this.getAllPaymentsUseCase.execute({ ...query, locataireId });
    return {
      data: result.data.map(PaymentResponse.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /payments/:id — Détail d'un paiement
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un paiement par son identifiant' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaymentResponse })
  @ApiResponse({ status: 404, description: 'Paiement introuvable' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentResponse> {
    const entity = await this.getPaymentUseCase.execute(id);
    return PaymentResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /payments/:id/confirm — Confirmer le paiement (marquer PAYE)
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmer la réception d\'un paiement',
    description: 'Passe le statut à PAYE. Enregistre la référence passerelle et la quittance si disponibles.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaymentResponse })
  @ApiResponse({ status: 404, description: 'Paiement introuvable' })
  @ApiResponse({ status: 422, description: 'Paiement déjà traité' })
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmPaymentDto,
  ): Promise<PaymentResponse> {
    const entity = await this.confirmPaymentUseCase.execute(id, dto);
    return PaymentResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /payments/:id/reject — Rejeter le paiement
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rejeter un paiement',
    description: 'Passe le statut à REJETE. Uniquement depuis EN_ATTENTE.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaymentResponse })
  @ApiResponse({ status: 404, description: 'Paiement introuvable' })
  @ApiResponse({ status: 422, description: 'Paiement non en attente' })
  async reject(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentResponse> {
    const entity = await this.rejectPaymentUseCase.execute(id);
    return PaymentResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /payments/:id/fail — Marquer le paiement comme ECHOUE
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id/fail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marquer un paiement comme échoué',
    description: 'Passe le statut à ECHOUE (ex : transaction rejetée par la passerelle). Uniquement depuis EN_ATTENTE.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaymentResponse })
  @ApiResponse({ status: 404, description: 'Paiement introuvable' })
  @ApiResponse({ status: 422, description: 'Paiement non en attente' })
  async markFailed(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentResponse> {
    const entity = await this.markPaymentFailedUseCase.execute(id);
    return PaymentResponse.fromEntity(entity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /payments/:id — Supprimer un paiement
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un paiement',
    description: 'Autorisé uniquement pour les statuts EN_ATTENTE et ECHOUE.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Paiement supprimé' })
  @ApiResponse({ status: 400, description: 'Statut ne permet pas la suppression' })
  @ApiResponse({ status: 404, description: 'Paiement introuvable' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deletePaymentUseCase.execute(id);
  }
}
