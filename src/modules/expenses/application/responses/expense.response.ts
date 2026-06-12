import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory, ExpenseStatus } from '@prisma/client';
import { ExpenseEntity } from '../../domain/entities/expense.entity';

export class ExpenseResponse {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiPropertyOptional({ nullable: true }) description: string | null;
  @ApiProperty() montant: number;
  @ApiProperty() date: Date;
  @ApiProperty({ enum: ExpenseCategory }) categorie: ExpenseCategory;
  @ApiProperty({ enum: ExpenseStatus }) statut: ExpenseStatus;
  @ApiProperty() beneficiaireNom: string;
  @ApiPropertyOptional({ nullable: true }) referenceId: string | null;
  @ApiPropertyOptional({ nullable: true }) justificatifUrl: string | null;
  @ApiProperty() payeurId: string;
  @ApiPropertyOptional({ nullable: true }) beneficiaireId: string | null;
  @ApiPropertyOptional({ nullable: true }) propertyId: string | null;
  @ApiPropertyOptional({ nullable: true }) ticketId: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(entity: ExpenseEntity): ExpenseResponse {
    const res = new ExpenseResponse();
    res.id = entity.id;
    res.titre = entity.titre;
    res.description = entity.description;
    res.montant = entity.montant;
    res.date = entity.date;
    res.categorie = entity.categorie;
    res.statut = entity.statut;
    res.beneficiaireNom = entity.beneficiaireNom;
    res.referenceId = entity.referenceId;
    res.justificatifUrl = entity.justificatifUrl;
    res.payeurId = entity.payeurId;
    res.beneficiaireId = entity.beneficiaireId;
    res.propertyId = entity.propertyId;
    res.ticketId = entity.ticketId;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    return res;
  }
}

export class PaginatedExpensesResponse {
  @ApiProperty({ type: [ExpenseResponse] }) data: ExpenseResponse[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}
