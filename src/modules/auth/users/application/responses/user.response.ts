import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UserEntity } from '../../../domain/entities/user.entity';

export class UserResponse {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() nom: string;
  @ApiProperty() prenom: string;
  @ApiProperty() fullName: string;
  @ApiProperty({ enum: Role }) role: Role;
  @ApiPropertyOptional({ nullable: true }) telephone: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(entity: UserEntity): UserResponse {
    const res = new UserResponse();
    res.id = entity.id;
    res.email = entity.email;
    res.nom = entity.nom;
    res.prenom = entity.prenom;
    res.fullName = entity.fullName;
    res.role = entity.role;
    res.telephone = entity.telephone;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    return res;
  }
}

export class PaginatedUsersResponse {
  @ApiProperty({ type: [UserResponse] }) data: UserResponse[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}
