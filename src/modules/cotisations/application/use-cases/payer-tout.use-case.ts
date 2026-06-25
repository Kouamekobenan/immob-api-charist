import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  AddTrancheResult,
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { AddTrancheDto } from '../dtos/add-tranche.dto';

@Injectable()
export class PayerToutUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(
    contributionId: string,
    locataireId: string,
    dto?: Pick<AddTrancheDto, 'referenceId' | 'recuUrl' | 'datePaiement'>,
  ): Promise<AddTrancheResult> {
    const contribution = await this.repo.findContributionById(contributionId);
    if (!contribution) throw new NotFoundException('Contribution introuvable');

    if (!contribution.canAcceptTranche()) {
      throw new UnprocessableEntityException(
        `Cette contribution ne peut plus recevoir de paiement (statut: ${contribution.statut})`,
      );
    }

    const membre = await this.repo.findMembreById(contribution.membreId);
    if (!membre || membre.locataireId !== locataireId) {
      throw new ForbiddenException('Vous ne pouvez payer que vos propres contributions');
    }

    return this.repo.addTranche(contributionId, {
      montant: contribution.montantRestant(),
      referenceId: dto?.referenceId,
      recuUrl: dto?.recuUrl,
      datePaiement: dto?.datePaiement ? new Date(dto.datePaiement) : new Date(),
    });
  }
}
