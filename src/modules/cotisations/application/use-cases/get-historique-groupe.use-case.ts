import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
  PeriodeSummary,
} from '../../domain/repositories/i-cotisation.repository';

@Injectable()
export class GetHistoriqueGroupeUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(groupeId: string): Promise<PeriodeSummary[]> {
    const groupe = await this.repo.findGroupeById(groupeId);
    if (!groupe) throw new NotFoundException('Groupe de cotisation introuvable');
    return this.repo.getHistoriqueGroupePeriodes(groupeId);
  }
}
