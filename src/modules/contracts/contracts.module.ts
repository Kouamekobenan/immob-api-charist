import { Module } from '@nestjs/common';

// ── Domain token ──────────────────────────────────────────────────────────────
import { CONTRACT_REPOSITORY } from './domain/repositories/i-contract.repository';

// ── Application — Use Cases ───────────────────────────────────────────────────
import { CreateContractUseCase } from './application/use-cases/create-contract.use-case';
import { GetContractUseCase } from './application/use-cases/get-contract.use-case';
import { GetAllContractsUseCase } from './application/use-cases/get-all-contracts.use-case';
import { UpdateContractUseCase } from './application/use-cases/update-contract.use-case';
import { TerminateContractUseCase } from './application/use-cases/terminate-contract.use-case';
import { DeleteContractUseCase } from './application/use-cases/delete-contract.use-case';

// ── Infrastructure ────────────────────────────────────────────────────────────
import { PrismaContractRepository } from './infrastructure/repositories/prisma-contract.repository';

// ── Presentation ──────────────────────────────────────────────────────────────
import { ContractsController } from './presentation/contracts.controller';

// ── Auth (pour JwtAuthGuard) ──────────────────────────────────────────────────
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ContractsController],
  providers: [
    // Binding interface → implémentation concrète
    { provide: CONTRACT_REPOSITORY, useClass: PrismaContractRepository },

    // Use Cases
    CreateContractUseCase,
    GetContractUseCase,
    GetAllContractsUseCase,
    UpdateContractUseCase,
    TerminateContractUseCase,
    DeleteContractUseCase,
  ],
})
export class ContractsModule {}
