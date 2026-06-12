import { TicketStatus, UrgencyLevel } from '@prisma/client';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../contracts/domain/repositories/i-contract.repository';
import { TicketEntity } from '../entities/ticket.entity';

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');

export interface CreateTicketData {
  titre: string;
  description: string;
  photos: string[];
  urgence: UrgencyLevel;
  propertyId: string;
  locataireId: string;
}

export interface UpdateTicketData {
  titre?: string;
  description?: string;
  photos?: string[];
  urgence?: UrgencyLevel;
  statut?: TicketStatus;
  prestataireId?: string | null;
}

export interface TicketFilters {
  propertyId?: string;
  locataireId?: string;
  prestataireId?: string;
  statut?: TicketStatus;
  urgence?: UrgencyLevel;
}

export interface ITicketRepository {
  findById(id: string): Promise<TicketEntity | null>;
  findAll(
    filters: TicketFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<TicketEntity>>;
  create(data: CreateTicketData): Promise<TicketEntity>;
  update(id: string, data: UpdateTicketData): Promise<TicketEntity>;
  delete(id: string): Promise<void>;
}
