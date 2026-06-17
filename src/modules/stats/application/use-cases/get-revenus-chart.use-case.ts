import { Injectable } from '@nestjs/common';
import { PrismaStatsService } from '../../infrastructure/prisma-stats.service';

@Injectable()
export class GetRevenusChartUseCase {
  constructor(private readonly statsService: PrismaStatsService) {}

  execute(months: number) {
    const clamped = Math.min(Math.max(months, 1), 24);
    return this.statsService.getRevenusChart(clamped);
  }
}
