import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/repositories/i-payment.repository';
import { PaymentEntity } from '../../domain/entities/payment.entity';

@Injectable()
export class GetPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Paiement introuvable (id: ${id})`);
    }
    return payment;
  }
}
