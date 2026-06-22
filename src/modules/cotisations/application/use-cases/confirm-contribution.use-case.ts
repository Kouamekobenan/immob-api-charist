import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { ConfirmContributionDto } from '../dtos/confirm-contribution.dto';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { ContributionEntity } from '../../domain/entities/contribution.entity';

@Injectable()
export class ConfirmContributionUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(id: string, dto: ConfirmContributionDto): Promise<ContributionEntity> {
    const contribution = await this.repo.findContributionById(id);
    if (!contribution) throw new NotFoundException(`Contribution introuvable`);
    if (!contribution.canBeConfirmed()) {
      throw new UnprocessableEntityException(
        `Cette contribution est déjà traitée (statut: ${contribution.statut})`,
      );
    }

    return this.repo.updateContributionStatut(id, PaymentStatus.PAYE, {
      referenceId: dto.referenceId,
      recuUrl: dto.recuUrl,
      datePaiement: dto.datePaiement ? new Date(dto.datePaiement) : new Date(),
    });
  }
}
