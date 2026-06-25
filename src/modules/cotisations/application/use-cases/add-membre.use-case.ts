import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AddMembreDto } from '../dtos/add-membre.dto';
import {
  COTISATION_REPOSITORY,
  ICotisationRepository,
} from '../../domain/repositories/i-cotisation.repository';
import { IUserRepository, USER_REPOSITORY } from '../../../auth/domain/repositories/i-user.repository';
import { CotisationMembreEntity } from '../../domain/entities/cotisation-membre.entity';

@Injectable()
export class AddMembreUseCase {
  constructor(
    @Inject(COTISATION_REPOSITORY)
    private readonly repo: ICotisationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(groupeId: string, dto: AddMembreDto): Promise<CotisationMembreEntity> {
    const groupe = await this.repo.findGroupeById(groupeId);
    if (!groupe) throw new NotFoundException(`Groupe de cotisation introuvable`);

    if (!groupe.canAddMembre()) {
      throw new UnprocessableEntityException(
        `Impossible d'ajouter un membre à un groupe ${groupe.statut}`,
      );
    }

    const locataire = await this.userRepo.findById(dto.locataireId);
    if (!locataire) {
      throw new NotFoundException(`Locataire introuvable (id: ${dto.locataireId})`);
    }

    const existant = await this.repo.findMembre(groupeId, dto.locataireId);
    if (existant) {
      throw new ConflictException(`Ce locataire est déjà membre de ce groupe`);
    }

    return this.repo.addMembre({ groupeId, locataireId: dto.locataireId });
  }
}
