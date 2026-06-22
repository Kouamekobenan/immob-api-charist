import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';

@Injectable()
export class SetTresorierUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(groupeId: string, membreId: string): Promise<void> {
    const groupe = await this.repo.findGroupeById(groupeId);
    if (!groupe) throw new NotFoundException(`Groupe de cotisation introuvable`);

    const membre = await this.repo.findMembreById(membreId);
    if (!membre || membre.groupeId !== groupeId || !membre.estActif) {
      throw new NotFoundException(`Membre introuvable dans ce groupe`);
    }

    await this.repo.setTresorier(groupeId, membreId);
  }
}
