import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { PaymentEntity } from '../../domain/entities/payment.entity';

export class PaymentResponse {
  @ApiProperty() id: string;
  @ApiProperty() montant: number;
  @ApiPropertyOptional({ nullable: true }) datePaiement: Date | null;
  @ApiProperty() periode: string;
  @ApiProperty({ enum: PaymentStatus }) statut: PaymentStatus;
  @ApiPropertyOptional({ nullable: true }) referenceId: string | null;
  @ApiPropertyOptional({ nullable: true }) recuUrl: string | null;
  @ApiProperty() contractId: string;
  @ApiProperty() locataireId: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(entity: PaymentEntity): PaymentResponse {
    const res = new PaymentResponse();
    res.id = entity.id;
    res.montant = entity.montant;
    res.datePaiement = entity.datePaiement;
    res.periode = entity.periode;
    res.statut = entity.statut;
    res.referenceId = entity.referenceId;
    res.recuUrl = entity.recuUrl;
    res.contractId = entity.contractId;
    res.locataireId = entity.locataireId;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    return res;
  }
}

export class PaginatedPaymentsResponse {
  @ApiProperty({ type: [PaymentResponse] }) data: PaymentResponse[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}
