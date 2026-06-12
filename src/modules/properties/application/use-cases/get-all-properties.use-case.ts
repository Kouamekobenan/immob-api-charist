import { Inject, Injectable } from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../../domain/repositories/i-property.repository';
import { PaginatedResult, PaginationOptions } from '../../../contracts/domain/repositories/i-contract.repository';
import { PropertyEntity } from '../../domain/entities/property.entity';
import { PropertyQueryDto } from '../dtos/property-query.dto';

@Injectable()
export class GetAllPropertiesUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(query: PropertyQueryDto): Promise<PaginatedResult<PropertyEntity>> {
    const pagination: PaginationOptions = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };

    return this.propertyRepository.findAll(
      {
        bailleurId: query.bailleurId,
        gerantId: query.gerantId,
        estOccupe: query.estOccupe,
        type: query.type,
        ville: query.ville,
        search: query.search,
      },
      pagination,
    );
  }
}
