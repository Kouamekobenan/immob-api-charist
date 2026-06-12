import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../../domain/repositories/i-ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { UpdateTicketStatusDto } from '../dtos/update-ticket-status.dto';

@Injectable()
export class UpdateTicketStatusUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(ticketId: string, dto: UpdateTicketStatusDto): Promise<TicketEntity> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket introuvable (id: ${ticketId})`);
    }

    if (!ticket.canTransitionTo(dto.statut)) {
      throw new UnprocessableEntityException(
        `Transition "${ticket.statut}" → "${dto.statut}" non autorisée`,
      );
    }

    const update: { statut: typeof dto.statut; prestataireId?: null } = {
      statut: dto.statut,
    };

    // Retrait automatique du prestataire si on revient à OUVERT
    if (dto.statut === 'OUVERT') {
      update.prestataireId = null;
    }

    return this.ticketRepository.update(ticketId, update);
  }
}
