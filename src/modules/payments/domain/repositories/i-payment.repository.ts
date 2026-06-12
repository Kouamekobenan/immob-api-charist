import { PaymentStatus } from '@prisma/client';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';
import { PaymentEntity } from '../entities/payment.entity';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface CreatePaymentData {
  montant: number;
  periode: string;
  contractId: string;
  locataireId: string;
}

export interface UpdatePaymentData {
  montant?: number;
  datePaiement?: Date | null;
  periode?: string;
  statut?: PaymentStatus;
  referenceId?: string | null;
  recuUrl?: string | null;
}

export interface PaymentFilters {
  contractId?: string;
  locataireId?: string;
  statut?: PaymentStatus;
  periode?: string;
}

export interface IPaymentRepository {
  findById(id: string): Promise<PaymentEntity | null>;
  findAll(
    filters: PaymentFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<PaymentEntity>>;
  findByContractAndPeriod(
    contractId: string,
    periode: string,
  ): Promise<PaymentEntity | null>;
  create(data: CreatePaymentData): Promise<PaymentEntity>;
  update(id: string, data: UpdatePaymentData): Promise<PaymentEntity>;
  delete(id: string): Promise<void>;
}
