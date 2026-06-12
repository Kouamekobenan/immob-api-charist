import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/repositories/i-payment.repository';

@Injectable()
export class DeletePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Paiement introuvable (id: ${id})`);
    }

    if (!payment.canBeDeleted()) {
      throw new BadRequestException(
        `Impossible de supprimer un paiement au statut "${payment.statut}". Seuls les paiements EN_ATTENTE ou ECHOUE peuvent être supprimés.`,
      );
    }

    await this.paymentRepository.delete(id);
  }
}
