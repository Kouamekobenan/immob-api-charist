import { Inject, Injectable } from '@nestjs/common';
import {
  IPaymentRepository,
  PaymentFilters,
  PAYMENT_REPOSITORY,
} from '../../domain/repositories/i-payment.repository';
import { PaginatedResult } from '../../../contracts/domain/repositories/i-contract.repository';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import { PaymentQueryDto } from '../dtos/payment-query.dto';

@Injectable()
export class GetAllPaymentsUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(query: PaymentQueryDto): Promise<PaginatedResult<PaymentEntity>> {
    const filters: PaymentFilters = {
      contractId: query.contractId,
      locataireId: query.locataireId,
      statut: query.statut,
      periode: query.periode,
    };
    return this.paymentRepository.findAll(filters, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
