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

@Injectable()
export class DeleteContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: IContractRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundException(`Contrat introuvable (id: ${id})`);
    }

    if (contract.isActive()) {
      throw new BadRequestException(
        'Impossible de supprimer un contrat actif. Résiliez-le d\'abord.',
      );
    }

    await this.contractRepository.delete(id);
  }
}
