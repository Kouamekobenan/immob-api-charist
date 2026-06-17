import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaStatsService } from './infrastructure/prisma-stats.service';
import { GetDashboardStatsUseCase } from './application/use-cases/get-dashboard-stats.use-case';
import { GetRevenusChartUseCase } from './application/use-cases/get-revenus-chart.use-case';
import { GetAlertesUseCase } from './application/use-cases/get-alertes.use-case';
import { StatsController } from './presentation/stats.controller';

@Module({
  imports: [AuthModule],
  controllers: [StatsController],
  providers: [
    PrismaStatsService,
    GetDashboardStatsUseCase,
    GetRevenusChartUseCase,
    GetAlertesUseCase,
  ],
})
export class StatsModule {}
