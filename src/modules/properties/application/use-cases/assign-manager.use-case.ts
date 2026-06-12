import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../../domain/repositories/i-property.repository';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { PropertyEntity } from '../../domain/entities/property.entity';
import { AssignManagerDto } from '../dtos/assign-manager.dto';

@Injectable()
export class AssignManagerUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepository: IPropertyRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(propertyId: string, dto: AssignManagerDto): Promise<PropertyEntity> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException(`Bien immobilier introuvable (id: ${propertyId})`);
    }

    const gerant = await this.prisma.user.findUnique({ where: { id: dto.gerantId } });
    if (!gerant) {
      throw new NotFoundException(`Gérant introuvable (id: ${dto.gerantId})`);
    }
    if (gerant.role !== 'GERANT' && gerant.role !== 'SUPER_ADMIN') {
      throw new UnprocessableEntityException(
        `L'utilisateur "${gerant.email}" n'a pas le rôle GERANT`,
      );
    }

    return this.propertyRepository.update(propertyId, { gerantId: dto.gerantId });
  }
}
