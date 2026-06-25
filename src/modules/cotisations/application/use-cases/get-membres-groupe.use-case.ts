import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { CotisationMembreEntity } from '../../domain/entities/cotisation-membre.entity';

@Injectable()
export class GetMembresGroupeUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(groupeId: string): Promise<CotisationMembreEntity[]> {
    const groupe = await this.repo.findGroupeById(groupeId);
    if (!groupe) throw new NotFoundException('Groupe de cotisation introuvable');
    return this.repo.findMembresActifs(groupeId);
  }
}
