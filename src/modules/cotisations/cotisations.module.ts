import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { COTISATION_REPOSITORY } from './domain/repositories/i-cotisation.repository';
import { PrismaCotisationRepository } from './infrastructure/repositories/prisma-cotisation.repository';

import { CreateGroupeUseCase } from './application/use-cases/create-groupe.use-case';
import { GetGroupeUseCase } from './application/use-cases/get-groupe.use-case';
import { GetAllGroupesUseCase } from './application/use-cases/get-all-groupes.use-case';
import { UpdateGroupeUseCase } from './application/use-cases/update-groupe.use-case';
import { AddMembreUseCase } from './application/use-cases/add-membre.use-case';
import { RemoveMembreUseCase } from './application/use-cases/remove-membre.use-case';
import { SetTresorierUseCase } from './application/use-cases/set-tresorier.use-case';
import { GenererContributionsUseCase } from './application/use-cases/generer-contributions.use-case';
import { ConfirmContributionUseCase } from './application/use-cases/confirm-contribution.use-case';
import { RejectContributionUseCase } from './application/use-cases/reject-contribution.use-case';
import { GetGroupeSummaryUseCase } from './application/use-cases/get-groupe-summary.use-case';
import { AddTranchePaiementUseCase } from './application/use-cases/add-tranche-paiement.use-case';
import { GetTranchesUseCase } from './application/use-cases/get-tranches.use-case';

import { CotisationsController } from './presentation/cotisations.controller';

const useCases = [
  CreateGroupeUseCase,
  GetGroupeUseCase,
  GetAllGroupesUseCase,
  UpdateGroupeUseCase,
  AddMembreUseCase,
  RemoveMembreUseCase,
  SetTresorierUseCase,
  GenererContributionsUseCase,
  ConfirmContributionUseCase,
  RejectContributionUseCase,
  GetGroupeSummaryUseCase,
  AddTranchePaiementUseCase,
  GetTranchesUseCase,
];

@Module({
  imports: [AuthModule],
  controllers: [CotisationsController],
  providers: [
    { provide: COTISATION_REPOSITORY, useClass: PrismaCotisationRepository },
    ...useCases,
  ],
})
export class CotisationsModule {}
