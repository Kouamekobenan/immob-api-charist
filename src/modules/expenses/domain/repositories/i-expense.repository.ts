import { ExpenseCategory, ExpenseStatus } from '@prisma/client';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';
import { ExpenseEntity } from '../entities/expense.entity';

export const EXPENSE_REPOSITORY = Symbol('EXPENSE_REPOSITORY');

export interface CreateExpenseData {
  titre: string;
  description?: string;
  montant: number;
  date: Date;
  categorie: ExpenseCategory;
  beneficiaireNom: string;
  payeurId: string;
  beneficiaireId?: string;
  propertyId?: string;
  ticketId?: string;
}

export interface UpdateExpenseData {
  statut?: ExpenseStatus;
  referenceId?: string | null;
  justificatifUrl?: string | null;
  titre?: string;
  description?: string | null;
  montant?: number;
  date?: Date;
  categorie?: ExpenseCategory;
  beneficiaireNom?: string;
}

export interface ExpenseFilters {
  payeurId?: string;
  propertyId?: string;
  categorie?: ExpenseCategory;
  statut?: ExpenseStatus;
  beneficiaireId?: string;
  ticketId?: string;
}

export interface IExpenseRepository {
  findById(id: string): Promise<ExpenseEntity | null>;
  findAll(
    filters: ExpenseFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<ExpenseEntity>>;
  findByTicket(ticketId: string): Promise<ExpenseEntity | null>;
  create(data: CreateExpenseData): Promise<ExpenseEntity>;
  update(id: string, data: UpdateExpenseData): Promise<ExpenseEntity>;
  delete(id: string): Promise<void>;
}
