import { ContractEntity } from '../entities/contract.entity';

export interface CreateContractData {
  dateDebut: Date;
  dateFin?: Date;
  loyerTotal: number;
  propertyId: string;
  locataireId: string;
}

export interface UpdateContractData {
  dateDebut?: Date;
  dateFin?: Date | null;
  loyerTotal?: number;
}

export interface ContractFilters {
  locataireId?: string;
  propertyId?: string;
  estActif?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IContractRepository {
  findById(id: string): Promise<ContractEntity | null>;
  findAll(
    filters: ContractFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<ContractEntity>>;
  findActiveByPropertyId(propertyId: string): Promise<ContractEntity | null>;
  findByLocataireId(locataireId: string): Promise<ContractEntity[]>;
  create(data: CreateContractData): Promise<ContractEntity>;
  update(id: string, data: UpdateContractData): Promise<ContractEntity>;
  terminate(id: string, dateFin: Date): Promise<ContractEntity>;
  delete(id: string): Promise<void>;
  /** Met à jour le flag estOccupe de la propriété liée */
  setPropertyOccupied(propertyId: string, occupied: boolean): Promise<void>;
}

export const CONTRACT_REPOSITORY = Symbol('CONTRACT_REPOSITORY');
