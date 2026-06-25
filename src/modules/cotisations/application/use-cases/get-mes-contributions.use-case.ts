import { Inject, Injectable } from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { ContributionEntity } from '../../domain/entities/contribution.entity';

export interface MonBilan {
  totalAttendu: number;
  totalPaye: number;
  totalRestant: number;
  contributions: ContributionEntity[];
}

@Injectable()
export class GetMesContributionsUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(locataireId: string, periode?: string): Promise<MonBilan> {
    const membres = await this.repo.findMembresByLocataire(locataireId);

    const nested = await Promise.all(
      membres.map((m) => this.repo.findContributionsByMembre(m.id)),
    );

    let contributions = nested.flat();
    if (periode) {
      contributions = contributions.filter((c) => c.periode === periode);
    }

    return {
      totalAttendu: contributions.reduce((sum, c) => sum + c.montant, 0),
      totalPaye: contributions.reduce((sum, c) => sum + c.montantPaye, 0),
      totalRestant: contributions.reduce((sum, c) => sum + c.montantRestant(), 0),
      contributions,
    };
  }
}
