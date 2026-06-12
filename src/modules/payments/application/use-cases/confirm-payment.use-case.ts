import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/repositories/i-payment.repository';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import { ConfirmPaymentDto } from '../dtos/confirm-payment.dto';

@Injectable()
export class ConfirmPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(id: string, dto: ConfirmPaymentDto): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Paiement introuvable (id: ${id})`);
    }

    if (!payment.canBeConfirmed()) {
      throw new UnprocessableEntityException(
        `Impossible de confirmer un paiement au statut "${payment.statut}"`,
      );
    }

    if (dto.referenceId) {
      const existingById = await this.paymentRepository.findById(id);
      if (existingById && existingById.referenceId === dto.referenceId && existingById.id !== id) {
        throw new ConflictException(
          `La référence "${dto.referenceId}" est déjà utilisée par un autre paiement`,
        );
      }
    }

    return this.paymentRepository.update(id, {
      statut: PaymentStatus.PAYE,
      datePaiement: dto.datePaiement,
      referenceId: dto.referenceId ?? null,
      recuUrl: dto.recuUrl ?? null,
    });
  }
}
