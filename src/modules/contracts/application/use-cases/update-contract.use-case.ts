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
import { UpdateContractDto } from '../dtos/update-contract.dto';

@Injectable()
export class UpdateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: IContractRepository,
  ) {}

  async execute(id: string, dto: UpdateContractDto): Promise<ContractEntity> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundException(`Contrat introuvable (id: ${id})`);
    }

    if (!contract.isActive()) {
      throw new BadRequestException('Impossible de modifier un contrat résilié');
    }

    // Validation croisée dateDebut / dateFin
    const newDateDebut = dto.dateDebut ? new Date(dto.dateDebut) : contract.dateDebut;
    const newDateFin =
      dto.dateFin === null
        ? null
        : dto.dateFin
          ? new Date(dto.dateFin)
          : contract.dateFin;

    if (newDateFin && newDateDebut >= newDateFin) {
      throw new BadRequestException('La date de début doit être antérieure à la date de fin');
    }

    return this.contractRepository.update(id, {
      dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
      dateFin: dto.dateFin === null ? null : dto.dateFin ? new Date(dto.dateFin) : undefined,
      loyerTotal: dto.loyerTotal,
    });
  }
}
