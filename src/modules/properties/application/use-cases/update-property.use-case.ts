import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../../domain/repositories/i-property.repository';
import { PropertyEntity } from '../../domain/entities/property.entity';
import { UpdatePropertyDto } from '../dtos/update-property.dto';

@Injectable()
export class UpdatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(id: string, dto: UpdatePropertyDto): Promise<PropertyEntity> {
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundException(`Bien immobilier introuvable (id: ${id})`);
    }

    return this.propertyRepository.update(id, {
      titre: dto.titre,
      description: dto.description,
      adresse: dto.adresse,
      ville: dto.ville,
      type: dto.type,
      loyerDeBase: dto.loyerDeBase,
      charges: dto.charges,
    });
  }
}
