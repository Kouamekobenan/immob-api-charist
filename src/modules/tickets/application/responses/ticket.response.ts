import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus, UrgencyLevel } from '@prisma/client';
import { TicketEntity } from '../../domain/entities/ticket.entity';

export class TicketResponse {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() description: string;
  @ApiProperty({ type: [String] }) photos: string[];
  @ApiProperty({ enum: UrgencyLevel }) urgence: UrgencyLevel;
  @ApiProperty({ enum: TicketStatus }) statut: TicketStatus;
  @ApiProperty() propertyId: string;
  @ApiProperty() locataireId: string;
  @ApiPropertyOptional({ nullable: true }) prestataireId: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(entity: TicketEntity): TicketResponse {
    const res = new TicketResponse();
    res.id = entity.id;
    res.titre = entity.titre;
    res.description = entity.description;
    res.photos = entity.photos;
    res.urgence = entity.urgence;
    res.statut = entity.statut;
    res.propertyId = entity.propertyId;
    res.locataireId = entity.locataireId;
    res.prestataireId = entity.prestataireId;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    return res;
  }
}

export class PaginatedTicketsResponse {
  @ApiProperty({ type: [TicketResponse] }) data: TicketResponse[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}
