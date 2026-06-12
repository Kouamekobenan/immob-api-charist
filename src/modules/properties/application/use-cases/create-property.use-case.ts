import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../../domain/repositories/i-property.repository';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { PropertyEntity } from '../../domain/entities/property.entity';

@Injectable()
export class CreatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepository: IPropertyRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreatePropertyDto): Promise<PropertyEntity> {
    const bailleur = await this.prisma.user.findUnique({ where: { id: dto.bailleurId } });
    if (!bailleur) {
      throw new NotFoundException(`Bailleur introuvable (id: ${dto.bailleurId})`);
    }
    if (bailleur.role !== 'BAILLEUR' && bailleur.role !== 'SUPER_ADMIN') {
      throw new UnprocessableEntityException(
        `L'utilisateur "${bailleur.email}" n'a pas le rôle BAILLEUR`,
      );
    }

    if (dto.gerantId) {
      const gerant = await this.prisma.user.findUnique({ where: { id: dto.gerantId } });
      if (!gerant) {
        throw new NotFoundException(`Gérant introuvable (id: ${dto.gerantId})`);
      }
      if (gerant.role !== 'GERANT' && gerant.role !== 'SUPER_ADMIN') {
        throw new UnprocessableEntityException(
          `L'utilisateur "${gerant.email}" n'a pas le rôle GERANT`,
        );
      }
    }

    return this.propertyRepository.create({
      titre: dto.titre,
      description: dto.description,
      adresse: dto.adresse,
      ville: dto.ville,
      type: dto.type,
      loyerDeBase: dto.loyerDeBase,
      charges: dto.charges ?? 0,
      bailleurId: dto.bailleurId,
      gerantId: dto.gerantId,
    });
  }
}
