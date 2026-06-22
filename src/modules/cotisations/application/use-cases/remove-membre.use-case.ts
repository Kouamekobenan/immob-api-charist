import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';

@Injectable()
export class RemoveMembreUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
  ) {}

  async execute(groupeId: string, membreId: string): Promise<void> {
    const membre = await this.repo.findMembreById(membreId);
    if (!membre || membre.groupeId !== groupeId || !membre.estActif) {
      throw new NotFoundException(`Membre introuvable dans ce groupe`);
    }
    if (membre.estTresorier) {
      throw new UnprocessableEntityException(
        `Impossible de retirer le trésorier. Désignez un autre trésorier d'abord.`,
      );
    }
    await this.repo.removeMembre(membreId);
  }
}
