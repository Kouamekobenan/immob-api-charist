import { Inject, Injectable } from '@nestjs/common';
import { CreateGroupeDto } from '../dtos/create-groupe.dto';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { CotisationGroupeEntity } from '../../domain/entities/cotisation-groupe.entity';

@Injectable()
export class CreateGroupeUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(dto: CreateGroupeDto, createurId: string): Promise<CotisationGroupeEntity> {
    return this.repo.createGroupe({
      nom: dto.nom,
      description: dto.description,
      montantParMembre: dto.montantParMembre,
      propertyId: dto.propertyId,
      createurId,
    });
  }
}
