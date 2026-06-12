import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CONTRACT_REPOSITORY,
  IContractRepository,
} from '../../domain/repositories/i-contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';

@Injectable()
export class GetContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: IContractRepository,
  ) {}

  async execute(id: string): Promise<ContractEntity> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundException(`Contrat introuvable (id: ${id})`);
    }
    return contract;
  }
}
