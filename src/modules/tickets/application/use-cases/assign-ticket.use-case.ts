import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../../domain/repositories/i-ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { AssignTicketDto } from '../dtos/assign-ticket.dto';

@Injectable()
export class AssignTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: ITicketRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(ticketId: string, dto: AssignTicketDto): Promise<TicketEntity> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket introuvable (id: ${ticketId})`);
    }

    if (!ticket.canTransitionTo(TicketStatus.ASSIGNE)) {
      throw new UnprocessableEntityException(
        `Impossible d'assigner un ticket au statut "${ticket.statut}"`,
      );
    }

    const prestataire = await this.prisma.user.findUnique({
      where: { id: dto.prestataireId },
    });
    if (!prestataire) {
      throw new NotFoundException(`Prestataire introuvable (id: ${dto.prestataireId})`);
    }
    if (prestataire.role !== 'PRESTATAIRE' && prestataire.role !== 'SUPER_ADMIN') {
      throw new UnprocessableEntityException(
        `L'utilisateur "${prestataire.email}" n'a pas le rôle PRESTATAIRE`,
      );
    }

    return this.ticketRepository.update(ticketId, {
      prestataireId: dto.prestataireId,
      statut: TicketStatus.ASSIGNE,
    });
  }
}
