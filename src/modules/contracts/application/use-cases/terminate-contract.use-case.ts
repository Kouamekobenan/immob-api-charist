import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CONTRACT_REPOSITORY,
  IContractRepository,
} from '../../domain/repositories/i-contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';

@Injectable()
export class TerminateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: IContractRepository,
  ) {}

  async execute(id: string, dateFin?: string): Promise<ContractEntity> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundException(`Contrat introuvable (id: ${id})`);
    }

    if (!contract.isActive()) {
      throw new BadRequestException('Ce contrat est déjà résilié');
    }

    const terminationDate = dateFin ? new Date(dateFin) : new Date();

    if (terminationDate < contract.dateDebut) {
      throw new BadRequestException(
        'La date de résiliation ne peut pas être antérieure à la date de début du contrat',
      );
    }

    const terminated = await this.contractRepository.terminate(id, terminationDate);

    // Libère le bien immobilier
    await this.contractRepository.setPropertyOccupied(contract.propertyId, false);

    return terminated;
  }
}
