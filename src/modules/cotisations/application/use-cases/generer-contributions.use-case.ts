import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GenererContributionsDto } from '../dtos/generer-contributions.dto';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { ContributionEntity } from '../../domain/entities/contribution.entity';

@Injectable()
export class GenererContributionsUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(groupeId: string, dto: GenererContributionsDto): Promise<ContributionEntity[]> {
    const groupe = await this.repo.findGroupeById(groupeId);
    if (!groupe) throw new NotFoundException(`Groupe de cotisation introuvable`);
    if (!groupe.canGenererContributions()) {
      throw new UnprocessableEntityException(
        `Impossible de générer des contributions pour un groupe ${groupe.statut}`,
      );
    }

    const periode = dto.periode ?? this.currentPeriode();
    const membres = await this.repo.findMembresActifs(groupeId);

    if (membres.length === 0) {
      throw new UnprocessableEntityException(`Le groupe n'a aucun membre actif`);
    }

    const created: ContributionEntity[] = [];

    for (const membre of membres) {
      const existante = await this.repo.findContribution(groupeId, membre.id, periode);
      if (existante) {
        throw new ConflictException(
          `Les contributions pour la période ${periode} existent déjà`,
        );
      }
      const contribution = await this.repo.createContribution({
        groupeId,
        membreId: membre.id,
        montant: groupe.montantParMembre,
        periode,
      });
      created.push(contribution);
    }

    return created;
  }

  private currentPeriode(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${month}-${now.getFullYear()}`;
  }
}
