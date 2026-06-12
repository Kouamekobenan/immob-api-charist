import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../../domain/repositories/i-property.repository';
import { PropertyEntity } from '../../domain/entities/property.entity';

@Injectable()
export class RemoveManagerUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(propertyId: string): Promise<PropertyEntity> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException(`Bien immobilier introuvable (id: ${propertyId})`);
    }

    if (!property.isManaged()) {
      throw new BadRequestException('Ce bien n\'a pas de gérant assigné');
    }

    return this.propertyRepository.update(propertyId, { gerantId: null });
  }
}
