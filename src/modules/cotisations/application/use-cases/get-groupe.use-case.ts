import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { CotisationGroupeEntity } from '../../domain/entities/cotisation-groupe.entity';

@Injectable()
export class GetGroupeUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(id: string): Promise<CotisationGroupeEntity> {
    const groupe = await this.repo.findGroupeById(id);
    if (!groupe) throw new NotFoundException(`Groupe de cotisation introuvable`);
    return groupe;
  }
}
