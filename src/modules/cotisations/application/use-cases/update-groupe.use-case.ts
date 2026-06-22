import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateGroupeDto } from '../dtos/update-groupe.dto';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { CotisationGroupeEntity } from '../../domain/entities/cotisation-groupe.entity';

@Injectable()
export class UpdateGroupeUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(id: string, dto: UpdateGroupeDto): Promise<CotisationGroupeEntity> {
    const groupe = await this.repo.findGroupeById(id);
    if (!groupe) throw new NotFoundException(`Groupe de cotisation introuvable`);
    return this.repo.updateGroupe(id, dto);
  }
}
