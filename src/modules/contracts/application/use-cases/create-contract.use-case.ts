import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CONTRACT_REPOSITORY,
  IContractRepository,
} from '../../domain/repositories/i-contract.repository';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { CreateContractDto } from '../dtos/create-contract.dto';
import { ContractEntity } from '../../domain/entities/contract.entity';

@Injectable()
export class CreateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: IContractRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateContractDto): Promise<ContractEntity> {
    // Vérifie que le bien existe
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Bien immobilier introuvable (id: ${dto.propertyId})`);
    }

    // Vérifie que le locataire existe et a bien le rôle LOCATAIRE
    const locataire = await this.prisma.user.findUnique({
      where: { id: dto.locataireId },
    });
    if (!locataire) {
      throw new NotFoundException(`Locataire introuvable (id: ${dto.locataireId})`);
    }

    // Vérifie qu'il n'y a pas déjà un contrat actif sur ce bien
    const activeContract = await this.contractRepository.findActiveByPropertyId(dto.propertyId);
    if (activeContract) {
      throw new ConflictException(
        `Ce bien possède déjà un contrat actif (id: ${activeContract.id}). Résiliez-le avant d'en créer un nouveau.`,
      );
    }

    const contract = await this.contractRepository.create({
      dateDebut: new Date(dto.dateDebut),
      dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
      loyerTotal: dto.loyerTotal,
      propertyId: dto.propertyId,
      locataireId: dto.locataireId,
    });

    // Marque le bien comme occupé
    await this.contractRepository.setPropertyOccupied(dto.propertyId, true);

    return contract;
  }
}
