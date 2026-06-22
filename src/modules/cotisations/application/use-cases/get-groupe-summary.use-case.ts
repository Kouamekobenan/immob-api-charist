import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  GroupeSummary,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';

@Injectable()
export class GetGroupeSummaryUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(groupeId: string, periode?: string): Promise<GroupeSummary> {
    const groupe = await this.repo.findGroupeById(groupeId);
    if (!groupe) throw new NotFoundException(`Groupe de cotisation introuvable`);
    return this.repo.getGroupeSummary(groupeId, periode ?? this.currentPeriode());
  }

  private currentPeriode(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${month}-${now.getFullYear()}`;
  }
}
