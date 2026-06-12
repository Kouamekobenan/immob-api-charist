import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContractResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  dateDebut: Date;

  @ApiPropertyOptional({ example: '2027-06-30T00:00:00.000Z', nullable: true })
  dateFin: Date | null;

  @ApiProperty({ example: 85000, description: 'Loyer total (base + charges)' })
  loyerTotal: number;

  @ApiProperty({ example: true })
  estActif: boolean;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  propertyId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  locataireId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedContractsResponse {
  @ApiProperty({ type: [ContractResponse] })
  data: ContractResponse[];

  @ApiProperty({ example: 42, description: 'Nombre total de contrats' })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5, description: 'Nombre total de pages' })
  totalPages: number;
}
