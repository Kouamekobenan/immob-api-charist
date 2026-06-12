import { Injectable } from '@nestjs/common';
import { Prisma, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  CreatePaymentData,
  IPaymentRepository,
  PaymentFilters,
  UpdatePaymentData,
} from '../../domain/repositories/i-payment.repository';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';

type PrismaPayment = {
  id: string;
  montant: number;
  datePaiement: Date | null;
  periode: string;
  statut: PaymentStatus;
  referenceId: string | null;
  recuUrl: string | null;
  contractId: string;
  locataireId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PaymentEntity | null> {
    const p = await this.prisma.payment.findUnique({ where: { id } });
    return p ? this.toEntity(p) : null;
  }

  async findAll(
    filters: PaymentFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<PaymentEntity>> {
    const where: Prisma.PaymentWhereInput = {
      ...(filters.contractId && { contractId: filters.contractId }),
      ...(filters.locataireId && { locataireId: filters.locataireId }),
      ...(filters.statut && { statut: filters.statut }),
      ...(filters.periode && { periode: filters.periode }),
    };

    const skip = (pagination.page - 1) * pagination.limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((p) => this.toEntity(p)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findByContractAndPeriod(
    contractId: string,
    periode: string,
  ): Promise<PaymentEntity | null> {
    const p = await this.prisma.payment.findFirst({
      where: { contractId, periode },
    });
    return p ? this.toEntity(p) : null;
  }

  async create(data: CreatePaymentData): Promise<PaymentEntity> {
    const p = await this.prisma.payment.create({
      data: {
        montant: data.montant,
        periode: data.periode,
        contractId: data.contractId,
        locataireId: data.locataireId,
      },
    });
    return this.toEntity(p);
  }

  async update(id: string, data: UpdatePaymentData): Promise<PaymentEntity> {
    const p = await this.prisma.payment.update({
      where: { id },
      data: {
        ...(data.montant !== undefined && { montant: data.montant }),
        ...(data.datePaiement !== undefined && { datePaiement: data.datePaiement }),
        ...(data.periode !== undefined && { periode: data.periode }),
        ...(data.statut !== undefined && { statut: data.statut }),
        ...(data.referenceId !== undefined && { referenceId: data.referenceId }),
        ...(data.recuUrl !== undefined && { recuUrl: data.recuUrl }),
      },
    });
    return this.toEntity(p);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({ where: { id } });
  }

  private toEntity(p: PrismaPayment): PaymentEntity {
    return new PaymentEntity(
      p.id,
      p.montant,
      p.datePaiement,
      p.periode,
      p.statut,
      p.referenceId,
      p.recuUrl,
      p.contractId,
      p.locataireId,
      p.createdAt,
      p.updatedAt,
    );
  }
}
