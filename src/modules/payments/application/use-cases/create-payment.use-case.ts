import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/repositories/i-payment.repository';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import { CreatePaymentDto } from '../dtos/create-payment.dto';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentEntity> {
    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
    });
    if (!contract) {
      throw new NotFoundException(`Contrat introuvable (id: ${dto.contractId})`);
    }
    if (!contract.estActif) {
      throw new UnprocessableEntityException(
        'Impossible de créer un paiement sur un contrat résilié',
      );
    }
    if (contract.locataireId !== dto.locataireId) {
      throw new UnprocessableEntityException(
        'Le locataire ne correspond pas au contrat',
      );
    }

    const existing = await this.paymentRepository.findByContractAndPeriod(
      dto.contractId,
      dto.periode,
    );
    if (existing) {
      throw new ConflictException(
        `Un paiement pour la période ${dto.periode} existe déjà sur ce contrat`,
      );
    }

    return this.paymentRepository.create({
      montant: dto.montant,
      periode: dto.periode,
      contractId: dto.contractId,
      locataireId: dto.locataireId,
    });
  }
}
