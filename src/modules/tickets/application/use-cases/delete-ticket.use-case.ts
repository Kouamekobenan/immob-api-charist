import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../../domain/repositories/i-ticket.repository';

@Injectable()
export class DeleteTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket introuvable (id: ${id})`);
    }

    if (!ticket.canBeDeleted()) {
      throw new BadRequestException(
        `Impossible de supprimer un ticket au statut "${ticket.statut}". Seuls les tickets OUVERT peuvent être supprimés.`,
      );
    }

    await this.ticketRepository.delete(id);
  }
}
