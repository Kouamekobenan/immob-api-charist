import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { PAYMENT_REPOSITORY } from './domain/repositories/i-payment.repository';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository';

import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { GetPaymentUseCase } from './application/use-cases/get-payment.use-case';
import { GetAllPaymentsUseCase } from './application/use-cases/get-all-payments.use-case';
import { ConfirmPaymentUseCase } from './application/use-cases/confirm-payment.use-case';
import { RejectPaymentUseCase } from './application/use-cases/reject-payment.use-case';
import { MarkPaymentFailedUseCase } from './application/use-cases/mark-payment-failed.use-case';
import { DeletePaymentUseCase } from './application/use-cases/delete-payment.use-case';

import { PaymentsController } from './presentation/payments.controller';

const useCases = [
  CreatePaymentUseCase,
  GetPaymentUseCase,
  GetAllPaymentsUseCase,
  ConfirmPaymentUseCase,
  RejectPaymentUseCase,
  MarkPaymentFailedUseCase,
  DeletePaymentUseCase,
];

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController],
  providers: [
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PrismaPaymentRepository,
    },
    ...useCases,
  ],
  exports: [PAYMENT_REPOSITORY],
})
export class PaymentsModule {}
