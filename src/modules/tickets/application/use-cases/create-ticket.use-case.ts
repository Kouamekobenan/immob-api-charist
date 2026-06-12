import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { CloudinaryService } from '../../../cloudinary/claudinary.service';
import {
  ITicketRepository,
  TICKET_REPOSITORY,
} from '../../domain/repositories/i-ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { UrgencyLevel } from '@prisma/client';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: ITicketRepository,
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async execute(
    dto: CreateTicketDto,
    files: Express.Multer.File[],
  ): Promise<TicketEntity> {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Bien introuvable (id: ${dto.propertyId})`);
    }

    const locataire = await this.prisma.user.findUnique({
      where: { id: dto.locataireId },
    });
    if (!locataire) {
      throw new NotFoundException(`Locataire introuvable (id: ${dto.locataireId})`);
    }
    if (locataire.role !== 'LOCATAIRE' && locataire.role !== 'SUPER_ADMIN') {
      throw new UnprocessableEntityException(
        `L'utilisateur "${locataire.email}" n'a pas le rôle LOCATAIRE`,
      );
    }

    const photoUrls = files && files.length > 0
      ? await Promise.all(files.map((f) => this.cloudinary.upload(f, 'image')))
      : [];

    return this.ticketRepository.create({
      titre: dto.titre,
      description: dto.description,
      photos: photoUrls,
      urgence: dto.urgence ?? UrgencyLevel.MOYEN,
      propertyId: dto.propertyId,
      locataireId: dto.locataireId,
    });
  }
}
