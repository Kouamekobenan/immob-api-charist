import { Inject, Injectable } from '@nestjs/common';
import {
  CONTRACT_REPOSITORY,
  IContractRepository,
  PaginatedResult,
} from '../../domain/repositories/i-contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { ContractQueryDto } from '../dtos/contract-query.dto';

@Injectable()
export class GetAllContractsUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: IContractRepository,
  ) {}

  async execute(query: ContractQueryDto): Promise<PaginatedResult<ContractEntity>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return this.contractRepository.findAll(
      {
        locataireId: query.locataireId,
        propertyId: query.propertyId,
        estActif: query.estActif,
      },
      { page, limit },
    );
  }
}
