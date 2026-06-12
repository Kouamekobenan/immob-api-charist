import { Injectable } from '@nestjs/common';
import { ExpenseCategory, ExpenseStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  CreateExpenseData,
  ExpenseFilters,
  IExpenseRepository,
  UpdateExpenseData,
} from '../../domain/repositories/i-expense.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';

type PrismaExpense = {
  id: string;
  titre: string;
  description: string | null;
  montant: number;
  date: Date;
  categorie: ExpenseCategory;
  statut: ExpenseStatus;
  beneficiaireNom: string;
  referenceId: string | null;
  justificatifUrl: string | null;
  payeurId: string;
  beneficiaireId: string | null;
  propertyId: string | null;
  ticketId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaExpenseRepository implements IExpenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ExpenseEntity | null> {
    const e = await this.prisma.expense.findUnique({ where: { id } });
    return e ? this.toEntity(e) : null;
  }

  async findAll(
    filters: ExpenseFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<ExpenseEntity>> {
    const where: Prisma.ExpenseWhereInput = {
      ...(filters.payeurId && { payeurId: filters.payeurId }),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.beneficiaireId && { beneficiaireId: filters.beneficiaireId }),
      ...(filters.categorie && { categorie: filters.categorie }),
      ...(filters.statut && { statut: filters.statut }),
      ...(filters.ticketId && { ticketId: filters.ticketId }),
    };

    const skip = (pagination.page - 1) * pagination.limit;

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses.map((e) => this.toEntity(e)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findByTicket(ticketId: string): Promise<ExpenseEntity | null> {
    const e = await this.prisma.expense.findUnique({ where: { ticketId } });
    return e ? this.toEntity(e) : null;
  }

  async create(data: CreateExpenseData): Promise<ExpenseEntity> {
    const e = await this.prisma.expense.create({
      data: {
        titre: data.titre,
        description: data.description ?? null,
        montant: data.montant,
        date: data.date,
        categorie: data.categorie,
        beneficiaireNom: data.beneficiaireNom,
        payeurId: data.payeurId,
        beneficiaireId: data.beneficiaireId ?? null,
        propertyId: data.propertyId ?? null,
        ticketId: data.ticketId ?? null,
      },
    });
    return this.toEntity(e);
  }

  async update(id: string, data: UpdateExpenseData): Promise<ExpenseEntity> {
    const e = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(data.statut !== undefined && { statut: data.statut }),
        ...(data.referenceId !== undefined && { referenceId: data.referenceId }),
        ...(data.justificatifUrl !== undefined && { justificatifUrl: data.justificatifUrl }),
        ...(data.titre !== undefined && { titre: data.titre }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.montant !== undefined && { montant: data.montant }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.categorie !== undefined && { categorie: data.categorie }),
        ...(data.beneficiaireNom !== undefined && { beneficiaireNom: data.beneficiaireNom }),
      },
    });
    return this.toEntity(e);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expense.delete({ where: { id } });
  }

  private toEntity(e: PrismaExpense): ExpenseEntity {
    return new ExpenseEntity(
      e.id,
      e.titre,
      e.description,
      e.montant,
      e.date,
      e.categorie,
      e.statut,
      e.beneficiaireNom,
      e.referenceId,
      e.justificatifUrl,
      e.payeurId,
      e.beneficiaireId,
      e.propertyId,
      e.ticketId,
      e.createdAt,
      e.updatedAt,
    );
  }
}
