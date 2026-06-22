import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { ContributionEntity } from '../../domain/entities/contribution.entity';

@Injectable()
export class RejectContributionUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(id: string): Promise<ContributionEntity> {
    const contribution = await this.repo.findContributionById(id);
    if (!contribution) throw new NotFoundException(`Contribution introuvable`);
    if (!contribution.canBeRejected()) {
      throw new UnprocessableEntityException(
        `Cette contribution ne peut pas être rejetée (statut: ${contribution.statut})`,
      );
    }
    return this.repo.updateContributionStatut(id, PaymentStatus.REJETE);
  }
}
