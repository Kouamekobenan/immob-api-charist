import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AddTrancheDto } from '../dtos/add-tranche.dto';
import {
  AddTrancheResult,
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';

@Injectable()
export class AddTranchePaiementUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(contributionId: string, dto: AddTrancheDto): Promise<AddTrancheResult> {
    const contribution = await this.repo.findContributionById(contributionId);
    if (!contribution) throw new NotFoundException(`Contribution introuvable`);

    if (!contribution.canAcceptTranche()) {
      throw new UnprocessableEntityException(
        `Cette contribution ne peut plus recevoir de paiement (statut: ${contribution.statut})`,
      );
    }

    if (dto.montant > contribution.montantRestant()) {
      throw new BadRequestException(
        `La tranche (${dto.montant}) dépasse le montant restant dû (${contribution.montantRestant()})`,
      );
    }

    return this.repo.addTranche(contributionId, {
      montant: dto.montant,
      referenceId: dto.referenceId,
      recuUrl: dto.recuUrl,
      datePaiement: dto.datePaiement ? new Date(dto.datePaiement) : new Date(),
    });
  }
}
