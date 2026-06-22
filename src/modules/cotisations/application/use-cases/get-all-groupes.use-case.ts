import { Inject, Injectable } from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { CotisationGroupeEntity } from '../../domain/entities/cotisation-groupe.entity';

@Injectable()
export class GetAllGroupesUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(createurId?: string): Promise<CotisationGroupeEntity[]> {
    return this.repo.findAllGroupes(createurId);
  }
}
