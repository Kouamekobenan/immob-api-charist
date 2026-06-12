import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../../../cloudinary/claudinary.service';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../../domain/repositories/i-ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';

@Injectable()
export class AddPhotosUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: ITicketRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async execute(
    ticketId: string,
    files: Express.Multer.File[],
  ): Promise<TicketEntity> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket introuvable (id: ${ticketId})`);
    }

    if (!ticket.canAddPhotos()) {
      throw new BadRequestException(
        'Impossible d\'ajouter des photos à un ticket clôturé',
      );
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const newUrls = await Promise.all(
      files.map((f) => this.cloudinary.upload(f, 'image')),
    );

    return this.ticketRepository.update(ticketId, {
      photos: [...ticket.photos, ...newUrls],
    });
  }
}
