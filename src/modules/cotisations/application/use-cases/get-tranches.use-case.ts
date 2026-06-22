import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { TranchePaiementEntity } from '../../domain/entities/tranche-paiement.entity';

@Injectable()
export class GetTranchesUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(contributionId: string): Promise<TranchePaiementEntity[]> {
    const contribution = await this.repo.findContributionById(contributionId);
    if (!contribution) throw new NotFoundException(`Contribution introuvable`);
    return this.repo.findTranchesByContribution(contributionId);
  }
}
