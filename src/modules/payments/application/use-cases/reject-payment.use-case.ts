import {
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

@Injectable()
export class RejectPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Paiement introuvable (id: ${id})`);
    }

    if (!payment.canBeRejected()) {
      throw new UnprocessableEntityException(
        `Impossible de rejeter un paiement au statut "${payment.statut}"`,
      );
    }

    return this.paymentRepository.update(id, {
      statut: PaymentStatus.REJETE,
    });
  }
}
