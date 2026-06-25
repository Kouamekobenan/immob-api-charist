import { Inject, Injectable } from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { CotisationGroupeEntity } from '../../domain/entities/cotisation-groupe.entity';
import { CotisationMembreEntity } from '../../domain/entities/cotisation-membre.entity';
import { ContributionEntity } from '../../domain/entities/contribution.entity';

export interface MonGroupe {
  groupe: CotisationGroupeEntity;
  membre: CotisationMembreEntity;
  contributionCourante: ContributionEntity | null;
}

@Injectable()
export class GetMesGroupesUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(locataireId: string, periode?: string): Promise<MonGroupe[]> {
    const currentPeriode = periode ?? this.currentPeriode();
    const membres = await this.repo.findMembresByLocataire(locataireId);

    return Promise.all(
      membres.map(async (membre) => {
        const groupe = await this.repo.findGroupeById(membre.groupeId);
        const contributionCourante = await this.repo.findContribution(
          membre.groupeId,
          membre.id,
          currentPeriode,
        );
        return { groupe: groupe!, membre, contributionCourante };
      }),
    );
  }

  private currentPeriode(): string {
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  }
}
