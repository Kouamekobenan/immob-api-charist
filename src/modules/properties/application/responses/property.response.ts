import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';

export class PropertyResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Villa Duplex Chic — Cocody' })
  titre: string;

  @ApiPropertyOptional({ example: 'Beau duplex avec terrasse.', nullable: true })
  description: string | null;

  @ApiProperty({ example: '12 Rue des Jacarandas, Cocody' })
  adresse: string;

  @ApiProperty({ example: 'Abidjan' })
  ville: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.VILLA })
  type: PropertyType;

  @ApiProperty({ example: 150000, description: 'Loyer de base (FCFA)' })
  loyerDeBase: number;

  @ApiProperty({ example: 25000, description: 'Charges mensuelles (FCFA)' })
  charges: number;

  @ApiProperty({ example: 175000, description: 'Loyer total = base + charges (FCFA)' })
  loyerTotal: number;

  @ApiProperty({ example: false })
  estOccupe: boolean;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  bailleurId: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002', nullable: true })
  gerantId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedPropertiesResponse {
  @ApiProperty({ type: [PropertyResponse] })
  data: PropertyResponse[];

  @ApiProperty({ example: 35 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 4 })
  totalPages: number;
}
