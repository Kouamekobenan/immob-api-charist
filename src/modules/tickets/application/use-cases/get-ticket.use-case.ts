import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../../domain/repositories/i-ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';

@Injectable()
export class GetTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(id: string): Promise<TicketEntity> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket introuvable (id: ${id})`);
    }
    return ticket;
  }
}
