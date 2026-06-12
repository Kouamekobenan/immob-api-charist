import { Inject, Injectable } from '@nestjs/common';
import {
  ITicketRepository,
  TicketFilters,
  TICKET_REPOSITORY,
} from '../../domain/repositories/i-ticket.repository';
import { PaginatedResult } from '../../../contracts/domain/repositories/i-contract.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { TicketQueryDto } from '../dtos/ticket-query.dto';

@Injectable()
export class GetAllTicketsUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(query: TicketQueryDto): Promise<PaginatedResult<TicketEntity>> {
    const filters: TicketFilters = {
      propertyId: query.propertyId,
      locataireId: query.locataireId,
      prestataireId: query.prestataireId,
      statut: query.statut,
      urgence: query.urgence,
    };
    return this.ticketRepository.findAll(filters, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
