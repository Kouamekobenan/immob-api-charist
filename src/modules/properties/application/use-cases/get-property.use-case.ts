import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../../domain/repositories/i-property.repository';
import { PropertyEntity } from '../../domain/entities/property.entity';

@Injectable()
export class GetPropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(id: string): Promise<PropertyEntity> {
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundException(`Bien immobilier introuvable (id: ${id})`);
    }
    return property;
  }
}
